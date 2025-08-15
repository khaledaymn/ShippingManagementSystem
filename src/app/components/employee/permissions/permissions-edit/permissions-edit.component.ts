import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GroupService } from '../../../../core/services/group.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Group, Module, ModulePermission, CreateGroup, UpdateGroup, PermissionValue, Medule } from '../../../../core/models/group';

@Component({
  selector: 'app-permissions-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './permissions-edit.component.html',
  styleUrls: ['./permissions-edit.component.css'],
})
export class PermissionsEditComponent implements OnInit, OnDestroy {
  permissionForm: FormGroup;
  modules: Module[] = [
    { id: 1, name: 'Branchs'      , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 2, name: 'ChargeTypes'  , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 3, name: 'Employees'    , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 4, name: 'Cities'       , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 5, name: 'Governorates' , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 6, name: 'Permissions'  , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 7, name: 'Merchants'    , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 8, name: 'Orders'       , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 9, name: 'Delivary'     , permissions: { view: false, create: false, update: false, delete: false } },
    { id: 11,name: 'Settings'     , permissions: { view: false, create: false, update: false, delete: false } },
  ];
  loading = false;
  saving = false;
  isEditMode = false;
  groupId: number | null = null;
  showConfirmDialog = false;
  confirmDialogData: ConfirmationDialogData = {
    title: 'Discard Changes',
    message: 'You have unsaved changes. Are you sure you want to cancel?',
    confirmText: 'Discard',
    cancelText: 'Stay',
    type: 'warning',
    icon: 'bi-exclamation-triangle',
  };
  private destroy$ = new Subject<void>();
  private readonly PERMISSION_VALUES: PermissionValue = {
    CREATE: 0, // Changed to match [0, 1, 2, 3]
    VIEW: 1,
    UPDATE: 2,
    DELETE: 3,
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private notificationService: NotificationService
  ) {
    this.permissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        const parsedId = Number(id);
        if (isNaN(parsedId) || parsedId <= 0) {
          console.error('Invalid group ID:', id);
          this.notificationService.showError('Invalid group ID');
          this.router.navigate(['/permissions']);
          return;
        }
        this.isEditMode = true;
        this.groupId = parsedId;
        this.loadGroup();

      } else {
        // console.log('Create mode: Initializing empty form');
        this.permissionForm.reset();
        this.modules.forEach((module) => {
          module.permissions = { view: false, create: false, update: false, delete: false };
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // private loadMedules(): void{
  //   this.groupService.getAllMedules().subscribe({
  //     next :(response ) => {
  //       this.modules = response.data as Medule[]
  //     }
  //   })
  // }

  private loadGroup(): void {
    if (!this.groupId) {
      console.error('No groupId provided for edit mode');
      this.notificationService.showError('Invalid group ID');
      this.router.navigate(['/employee/settings/permissions']);
      return;
    }

    this.loading = true;
    this.groupService.getGroupById(this.groupId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (group: Group) => {
        // console.log('Loaded group:', JSON.stringify(group, null, 2));
        if (!group) {
          console.error('Group data is null or undefined');
          this.notificationService.showError('Group not found');
          this.router.navigate(['/employee/settings/permissions']);
          return;
        }
        this.permissionForm.patchValue({ name: group.name || '' });
        this.loadPermissions(group.permissions || {});
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading group:', error);
        this.notificationService.showError('Failed to load group data: ' + (error.message || 'Unknown error'));
        this.router.navigate(['/permissions']);
      },
    });
  }

  private loadPermissions(permissions: { [key: string]: number[] }): void {
    // console.log('Loading permissions:', JSON.stringify(permissions, null, 2));
    this.modules.forEach((module) => {
      const modulePerms = permissions[module.name] || [];
      module.permissions = {
        create: modulePerms.includes(this.PERMISSION_VALUES.CREATE),
        view: modulePerms.includes(this.PERMISSION_VALUES.VIEW),
        update: modulePerms.includes(this.PERMISSION_VALUES.UPDATE),
        delete: modulePerms.includes(this.PERMISSION_VALUES.DELETE),
      };
      // console.log(`Permissions for module ${module.name}:`, module.permissions);
    });
    this.permissionForm.markAsPristine();
  }

  onPermissionChange(moduleId: number, permissionType: keyof ModulePermission, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && typeof target.checked === 'boolean') {
      const checked = target.checked;
      const module = this.modules.find((m) => m.id === moduleId);
      if (!module) {
        console.warn('Module not found:', moduleId);
        this.notificationService.showError('Module not found');
        return;
      }

      module.permissions[permissionType] = checked;

      // Auto-select view if create, update, or delete is selected
      if (checked && permissionType !== 'view') {
        module.permissions.view = true;
      }

      // If view is unchecked, uncheck all other permissions
      if (!checked && permissionType === 'view') {
        module.permissions.create = false;
        module.permissions.update = false;
        module.permissions.delete = false;
      }

      this.permissionForm.markAsDirty();
      // console.log(`Permission ${permissionType} set to ${checked} for module ${module.name}`);
      this.notificationService.showInfo(`Permission ${permissionType} updated for ${module.name}`);
    } else {
      console.warn('Invalid event target or checked property');
      this.notificationService.showError('Failed to update permission');
    }
  }

  isPermissionChecked(moduleId: number, permissionType: keyof ModulePermission): boolean {
    const module = this.modules.find((m) => m.id === moduleId);
    return module ? module.permissions[permissionType] : false;
  }

  isPermissionDisabled(moduleId: number, permissionType: keyof ModulePermission): boolean {
    const module = this.modules.find((m) => m.id === moduleId);
    if (!module) return false;
    if (permissionType === 'view') {
      return module.permissions.create || module.permissions.update || module.permissions.delete;
    }
    return false;
  }

  hasAnyPermission(moduleId: number): boolean {
    const module = this.modules.find((m) => m.id === moduleId);
    if (!module) return false;
    return (
      module.permissions.view ||
      module.permissions.create ||
      module.permissions.update ||
      module.permissions.delete
    );
  }

  selectAllPermissions(moduleId: number): void {
    const module = this.modules.find((m) => m.id === moduleId);
    if (module) {
      module.permissions = { view: true, create: true, update: true, delete: true };
      this.permissionForm.markAsDirty();
      this.notificationService.showInfo(`All permissions selected for ${module.name}`);
    }
  }

  clearAllPermissions(moduleId: number): void {
    const module = this.modules.find((m) => m.id === moduleId);
    if (module) {
      module.permissions = { view: false, create: false, update: false, delete: false };
      this.permissionForm.markAsDirty();
      this.notificationService.showInfo(`All permissions cleared for ${module.name}`);
    }
  }

  onSubmit(): void {
    if (this.permissionForm.invalid || this.saving) {
      this.markFormGroupTouched();
      this.notificationService.showWarning('Please fill out all required fields');
      return;
    }

    this.saving = true;
    const formData = this.permissionForm.value;
    const permissions = this.buildPermissions();

    const requestData = {
      name: formData.name,
      permissions,
    };

    const request = this.isEditMode && this.groupId
      ? this.groupService.updateGroup(this.groupId, { ...requestData, id: this.groupId } as UpdateGroup)
      : this.groupService.createGroup(requestData as CreateGroup);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.showSuccess(
          this.isEditMode ? 'Group updated successfully' : 'Group created successfully'
        );
        this.router.navigate(['/employee/settings/permissions']);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error saving group:', error);
        this.notificationService.showError(
          this.isEditMode ? 'Failed to update group' : 'Failed to create group'
        );
      },
    });
  }

  private buildPermissions(): { id:number,values: number[] }[] {
    const permissions: { id:number,values: number[] }[] = [];
    this.modules.forEach((module) => {
      const perms: number[] = [];
      if (module.permissions.create) perms.push(this.PERMISSION_VALUES.CREATE);
      if (module.permissions.view) perms.push(this.PERMISSION_VALUES.VIEW);
      if (module.permissions.update) perms.push(this.PERMISSION_VALUES.UPDATE);
      if (module.permissions.delete) perms.push(this.PERMISSION_VALUES.DELETE);
      if (perms.length > 0) {
        permissions.push({ id: module.id, values: perms });
      }
    });
    // console.log('Built permissions:', JSON.stringify(permissions, null, 2));
    return permissions;
  }

  cancel(): void {
    if (this.permissionForm.dirty) {
      this.showConfirmDialog = true;
    } else {
      this.router.navigate(['/employee/settings/permissions']);
    }
  }

  onConfirmCancel(): void {
    this.showConfirmDialog = false;
    this.router.navigate(['/employee/settings/permissions']);
  }

  onCancelDialog(): void {
    this.showConfirmDialog = false;
  }

  private markFormGroupTouched(): void {
    Object.values(this.permissionForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.permissionForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.permissionForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Group name is required';
      if (field.errors['minlength']) return 'Group name must be at least 2 characters';
      if (field.errors['maxlength']) return 'Group name must not exceed 100 characters';
    }
    return '';
  }
}
