import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A reusable confirmation dialog component with customizable title, message, buttons, and size.
 * Supports different types (danger, warning, info, success), loading state, and accessibility features.
 */
@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent implements AfterViewInit {
  /** Controls the visibility of the dialog */
  @Input() show: boolean = false;
  /** Configuration data for the dialog */
  @Input() data: ConfirmationDialogData = {};
  /** Indicates if the dialog is in a loading state */
  @Input() loading: boolean = false;
  /** Enables closing the dialog with the Escape key */
  @Input() closeOnEscape: boolean = true;
  /** Enables closing the dialog by clicking the backdrop */
  @Input() closeOnBackdropClick: boolean = true;

  /** Emitted when the Confirm button is clicked */
  @Output() confirmed = new EventEmitter<void>();
  /** Emitted when the Cancel button or close button is clicked */
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('confirmButton') confirmButton!: ElementRef<HTMLButtonElement>;
  private previousActiveElement: HTMLElement | null = null;

  private defaultData: ConfirmationDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    icon: 'bi-exclamation-triangle',
    size: 'md'
  };

  /** Merges input data with default values */
  get mergedData(): ConfirmationDialogData {
    return { ...this.defaultData, ...this.data };
  }

  ngAfterViewInit(): void {
    if (this.show) {
      this.previousActiveElement = document.activeElement as HTMLElement;
      this.confirmButton?.nativeElement.focus();
    }
  }

  /** Handles Escape key press to close the dialog */
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.show && this.closeOnEscape && !this.loading) {
      this.onCancel();
    }
  }

  /** Handles backdrop click to close the dialog */
  onBackdropClick(): void {
    if (this.show && this.closeOnBackdropClick && !this.loading) {
      this.onCancel();
    }
  }

  /** Emits confirmed event and restores focus */
  onConfirm(): void {
    this.confirmed.emit();
    this.restoreFocus();
  }

  /** Emits cancelled event and restores focus */
  onCancel(): void {
    this.cancelled.emit();
    this.restoreFocus();
  }

  /** Returns dynamic class for modal dialog */
  getDialogClass(): string {
    const sizeClass = this.mergedData.size ? `modal-${this.mergedData.size}` : 'modal-md';
    return `modal-${this.mergedData.type || 'warning'} ${sizeClass}`;
  }

  /** Returns icon class based on input or default */
  getIconClass(): string {
    return this.mergedData.icon || this.getDefaultIconClass();
  }

  /** Returns button class based on type */
  getButtonClass(): string {
    return `btn-${this.mergedData.type || 'warning'}`;
  }

  /** Maps dialog type to default icon */
  private getDefaultIconClass(): string {
    switch (this.mergedData.type) {
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-triangle';
      case 'info':
        return 'bi-info-circle';
      case 'success':
        return 'bi-check-circle';
      default:
        return 'bi-exclamation-triangle';
    }
  }

  /** Restores focus to the previously active element */
  private restoreFocus(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }
}

/** Interface for dialog configuration */
export interface ConfirmationDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  extraButtons?: { text: string; class: string; action: () => void }[];
}
