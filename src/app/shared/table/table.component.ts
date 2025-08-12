import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from "@angular/core"
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms"
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from "rxjs"
import { CommonModule } from "@angular/common"
import {
  TableConfig,
  TableData,
  TableEvent,
  TableColumn,
  TableAction,
  TableSort,
} from "../../core/models/table"

@Component({
  selector: "app-table",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() config: TableConfig = {
    columns: [],
    searchable: false,
    selectable: false,
    pagination: false,
    showFooter: true,
  }
  @Input() data: TableData = { items: [], totalCount: 0, pageIndex: 1, pageSize: 10 }
  @Input() loading = false
  @Input() error: string | null = null
  @Input() title = ""
  @Input() subtitle = ""
  @Output() tableEvent = new EventEmitter<TableEvent>()

  searchForm!: FormGroup
  filterForm!: FormGroup
  currentSort: TableSort | null = null
  selectedItems: any[] = []
  showFilters = false
  searchTerm = ""
  currentPage = 1
  totalPages = 1
  pageNumbers: (number | string)[] = []
  pageSizeOptions = [5, 10, 15, 25, 50]
  allSelected = false
  sizeOption: any = 10

  private destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {}

  @ViewChild("searchInput") searchInput!: ElementRef

  ngOnInit(): void {
    this.initializeForms()
    this.calculatePagination()
    this.setupSearchSubscription()
    this.setupPageSizeOptions()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["config"] && !this.config?.columns?.length) {
      console.warn("TableConfig.columns is missing or empty")
    }
    if (changes["data"] && !this.data?.items) {
      console.warn("TableData.items is missing")
    }
    if (changes["data"]) {
      this.calculatePagination()
      this.updateSelectionState()
    }
    if (changes["loading"]) {
      this.updateFormState()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private initializeForms(): void {
    this.searchForm = this.fb.group({
      search: [""],
    })

    const filterControls: any = {}
    if (this.config?.filters) {
      this.config.filters.forEach((filter) => {
        filterControls[filter.key] = [""]
      })
    }
    this.filterForm = this.fb.group(filterControls)
  }

  private setupSearchSubscription(): void {
    if (this.config?.searchable) {
      this.searchForm
        ?.get("search")
        ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
        .subscribe((searchTerm) => {
          this.searchTerm = searchTerm || ""
          this.onSearch(this.searchTerm)
        })
    }
  }

  private setupPageSizeOptions(): void {
    this.pageSizeOptions = this.config?.pageSizeOptions?.length ? this.config.pageSizeOptions : [5, 10, 15, 25, 50]
  }

  private calculatePagination(): void {
    if (this.config?.pagination && this.data && this.data.pageSize > 0) {
      this.currentPage = this.data.pageIndex
      this.totalPages = Math.ceil(this.data.totalCount / this.data.pageSize) || 1
      this.generatePageNumbers()
    } else {
      this.currentPage = 1
      this.totalPages = 1
      this.pageNumbers = [1]
    }
  }

  private generatePageNumbers(): void {
    const maxVisiblePages = 5
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages))
    if (this.totalPages <= maxVisiblePages) {
      this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1)
      return
    }

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1)
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    this.pageNumbers = []
    if (startPage > 1) {
      this.pageNumbers.push(1)
      if (startPage > 2) {
        this.pageNumbers.push("...")
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i)
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        this.pageNumbers.push("...")
      }
      this.pageNumbers.push(this.totalPages)
    }
  }

  private updateSelectionState(): void {
    if (this.config?.selectable && this.data?.items) {
      this.allSelected = this.data.items.length > 0 && this.selectedItems.length === this.data.items.length
    }
  }

  private updateFormState(): void {
    if (this.loading) {
      this.searchForm?.disable()
      this.filterForm?.disable()
    } else {
      this.searchForm?.enable()
      this.filterForm?.enable()
    }
  }

  get activeFilterCount(): number {
    if (!this.filterForm) return 0
    return Object.keys(this.filterForm.value).filter((key) => this.filterForm.value[key]).length
  }

  // Computed property to check if actions column should be shown
  get shouldShowActionsColumn(): boolean {
    if (!this.config?.actions?.length || !this.data?.items?.length) {
      return false
    }
    return this.data.items.some((item) => this.hasVisibleActions(item))
  }

  // Get visible actions for an item
  getVisibleActions(item: any): TableAction[] {
    if (!this.config?.actions) return []

    return this.config.actions.filter((action) => {
      if (action.visible) {
        return action.visible(item)
      }
      return true
    })
  }

  // Check if any actions are visible for an item
  hasVisibleActions(item: any): boolean {
    return this.getVisibleActions(item).length > 0
  }

  // Check if item should show empty actions cell
  shouldShowEmptyActionsCell(item: any): boolean {
    return this.shouldShowActionsColumn && !this.hasVisibleActions(item)
  }

  onSort(column: TableColumn): void {
    if (!this.isSortable(column)) return
    let direction: "asc" | "desc" = "asc"
    if (this.currentSort?.column === column.key) {
      direction = this.currentSort.direction === "asc" ? "desc" : "asc"
    }
    this.currentSort = { column: column.key, direction }
    console.log(this.currentSort)
    this.tableEvent.emit({
      type: "sort",
      data: this.currentSort,
    })
  }

  onSearch(searchTerm: string): void {
    this.tableEvent.emit({
      type: "search",
      data: { search: searchTerm },
    })
  }

  onFilter(): void {
    if (!this.filterForm) return
    const filterValues = this.filterForm.value
    const activeFilters = Object.keys(filterValues)
      .filter((key) => filterValues[key] !== "" && filterValues[key] !== null)
      .reduce((obj, key) => {
        obj[key] = filterValues[key]
        return obj
      }, {} as any)

    this.tableEvent.emit({
      type: "filter",
      data: activeFilters,
    })
  }

  onClearFilters(): void {
    this.filterForm?.reset()
    this.onFilter()
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return
    this.tableEvent.emit({
      type: "page",
      data: { pageIndex: page, pageSize: this.data.pageSize },
    })
  }

  onPageSizeChange(event: Event): void {
    this.sizeOption = null
    const pageSize = Number.parseInt((event.target as HTMLSelectElement).value, 10)
    this.tableEvent.emit({
      type: "page",
      data: { pageIndex: 1, pageSize },
    })
  }

  onAction(action: string, item: any): void {
    this.tableEvent.emit({
      type: "action",
      data: { action, item },
    })
  }

  onSelectItem(item: any, event: Event): void {
    const selected = (event.target as HTMLInputElement).checked
    if (selected) {
      this.selectedItems.push(item)
    } else {
      this.selectedItems = this.selectedItems.filter((i) => i.id !== item.id)
    }
    this.updateSelectionState()
    this.tableEvent.emit({
      type: "select",
      data: { selectedItems: this.selectedItems },
    })
  }

  onSelectAll(event: Event): void {
    const selected = (event.target as HTMLInputElement).checked
    if (selected) {
      this.selectedItems = [...(this.data?.items || [])]
    } else {
      this.selectedItems = []
    }
    this.allSelected = selected
    this.tableEvent.emit({
      type: "select",
      data: { selectedItems: this.selectedItems },
    })
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.some((i) => i.id === item.id)
  }

  isActionDisabled(action: TableAction, item: any): boolean {
    return action.disabled ? action.disabled(item) : false
  }

  isSortable(column: TableColumn): boolean {
    return this.config?.sortable === true && column.sortable === true
  }

  getSortIcon(column: TableColumn): string {
    if (!this.currentSort || this.currentSort.column !== column.key) {
      return "bi-arrow-down-up text-muted"
    }
    return this.currentSort.direction === "asc" ? "bi-sort-up text-primary" : "bi-sort-down text-primary"
  }

  getSortIconClass(_column: TableColumn): string {
    return "" // Unused, as getSortIcon now includes the class
  }

  formatCellValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) return "-"
    if (column.format) {
      return column.format(value)
    }
    switch (column.type) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value)
      case "number":
        return new Intl.NumberFormat().format(value)
      case "date":
        return new Date(value).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      case "boolean":
        return value ? "Yes" : "No"
      default:
        return value.toString()
    }
  }

  getBadgeClass(value: any, column: TableColumn): string {    
    if (value === null || value === undefined) return "badge bg-secondary"
    if (column.type === "boolean") {
      return value ? "badge bg-success" : "badge bg-secondary"
    }
    return "badge bg-primary"
  }

  getBadgeText(value: any, column: TableColumn): string {
    if (value === null || value === undefined) return "-"
    if (column.type === "boolean") {
      return value ? "Active" : "Inactive"
    }
    return value.toString()
  }

  getColumnCount(): number {
    let count = this.config?.columns?.length || 0
    if (this.config?.selectable) count++
    if (this.shouldShowActionsColumn) count++
    return count
  }

  getFilterColumnClass(filter: any): string {
    switch (filter?.type) {
      case "select":
        return "col-md-3"
      case "date":
        return "col-md-2"
      case "number":
        return "col-md-2"
      default:
        return "col-md-3"
    }
  }

  getResultsText(): string {
    if (!this.data || this.data.totalCount === 0) return "No results"
    const adjustedPageIndex = this.data.pageIndex - 1
    const start = adjustedPageIndex * this.data.pageSize + 1
    const end = Math.min((adjustedPageIndex + 1) * this.data.pageSize, this.data.totalCount)
    return `Showing ${start} to ${end} of ${this.data.totalCount} results`
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters
    this.cdr.detectChanges()
  }

  trackByFn(index: number, item: any): any {
    return item.id ?? index
  }

  onToggleAction(item: any, columnKey: string) {
    item[columnKey] = !item[columnKey]
    this.tableEvent.emit({
      type: "update",
      data: { id: item.id, value: item["name"] },
    })
  }
}
