import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { ProfileService } from "../../core/services/profile.service";
import { AuthService } from "../../core/services/auth.service";
import { NotificationService } from "../../core/services/notification.service";
import { ChangePassword, UserProfile } from "../../core/models/profile";
import { NotificationComponent } from "../../shared/notification/notification.component";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  changePasswordForm: FormGroup;

  loading = false;
  profileLoading = false;
  passwordLoading = false;

  error: string | null = null;
  successMessage = "";

  userProfile: UserProfile | null = null;
  activeTab = "profile"; // 'profile', 'edit', or 'password'
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  userRole!: string | undefined
  currentUser: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {
    this.profileForm = this.fb.group({
      id: ["", Validators.required],
      name: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      address: [""],
    });

    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ["", Validators.required],
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.userRole = user?.roleId
      if (user) {
        this.changePasswordForm.patchValue({
          userId: user.id,
        });
      }
    });
  }

  private loadUserProfile(): void {
    if (!this.currentUser?.id) return;

    this.profileLoading = true;
    this.error = null;

    this.profileService
      .getUserProfile(this.currentUser.id,this.currentUser.roleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          // Normalize role names
          if (profile.role === "ShippingRepresentative") {
            profile.role = "Delivery";
          }
          this.userProfile = profile;
          this.profileForm.patchValue(profile);
          this.profileLoading = false;
        },
        error: (error) => {
          this.error = "Failed to load profile data";
          this.notificationService.showError(this.error);
          this.profileLoading = false;
        },
      });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.notificationService.showWarning("Please fill all required fields correctly.");
      return;
    }

    this.profileLoading = true;
    this.error = null;

    const profileData: UserProfile = this.profileForm.value;

    this.profileService
      .updateProfile(profileData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.successMessage = "Profile updated successfully";
            this.notificationService.showSuccess(this.successMessage);
            this.loadUserProfile();
          } else {
            this.error = "Failed to update profile";
            this.notificationService.showError(this.error);
          }
          this.profileLoading = false;
          this.clearMessages();
        },
        error: (error) => {
          this.error = "Failed to update profile";
          this.notificationService.showError(this.error);
          this.profileLoading = false;
        },
      });
  }

  onChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.markFormGroupTouched(this.changePasswordForm);
      this.notificationService.showWarning("Please fill all fields correctly.");
      return;
    }

    this.passwordLoading = true;
    this.error = null;

    const changePasswordData: ChangePassword = {
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      userId: this.currentUser.id,
    };

    this.profileService
      .changePassword(changePasswordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMessage = "Password changed successfully";
          this.notificationService.showSuccess(this.successMessage);
          this.changePasswordForm.reset();
          this.passwordLoading = false;
          this.clearMessages();
        },
        error: (error) => {
          this.error = "Failed to change password";
          this.notificationService.showError(this.error ?? "");
          this.passwordLoading = false;
        },
      });
  }

  setActiveTab(tab: string): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.activeTab = tab;
    this.error = null;
    this.successMessage = "";
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case "current":
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case "new":
        this.showNewPassword = !this.showNewPassword;
        break;
      case "confirm":
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  private passwordMatchValidator = (formGroup: FormGroup) => {
    const newPassword = formGroup.get("newPassword");
    const confirmPassword = formGroup.get("confirmPassword");

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword.setErrors(null);
    }
    return null;
  };

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.successMessage = "";
      this.error = null;
    }, 3000);
  }

  ModuleName(name: string){
    switch(name){
      case 'Branchs':
        return 'Branches'
      case 'ChargeTypes':
        return 'Shipping Types'
      case 'RejectedReasons':
        return 'Rejected Reasons'
      default :
        return null
    }
  }
}
