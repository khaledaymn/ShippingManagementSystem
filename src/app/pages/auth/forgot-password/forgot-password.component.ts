import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { ForgotPasswordRequest } from "../../../core/models/user"
import { NotificationService } from "../../../core/services/notification.service"
import { NotificationComponent } from "../../../shared/notification/notification.component";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NotificationComponent],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup
  isLoading = false
  errorMessage = ""
  successMessage = ""

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm)
      this.notificationService.showWarning("Please provide a valid email address.")
      return
    }

    this.isLoading = true
    this.errorMessage = ""
    this.successMessage = ""

    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email,
    }

    this.authService.forgotPassword(request).subscribe({
      next: (response) => {
        this.successMessage = "A password reset link has been sent to your email."
        this.notificationService.showSuccess(this.successMessage)

        setTimeout(() => {
          this.router.navigate(["/auth/login"])
        }, 5000)
      },
      error: (error) => {
        this.errorMessage = error.message || "An error occurred. Please try again later."
        this.notificationService.showError(this.errorMessage)
        this.isLoading = false
      },
      complete: () => {
        this.isLoading = false
      },
    })
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }
}
