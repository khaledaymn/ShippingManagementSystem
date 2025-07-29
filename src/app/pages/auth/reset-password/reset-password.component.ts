import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {
 FormBuilder,
 FormGroup,
 ReactiveFormsModule,
 Validators,
 ValidatorFn,
 AbstractControl,
} from "@angular/forms"
import { Router, RouterModule, ActivatedRoute } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { ResetPasswordRequest } from "../../../core/models/user"
import { NotificationService } from "../../../core/services/notification.service"
import { NotificationComponent } from "../../../shared/notification/notification.component";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NotificationComponent],
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup
  isLoading = false
  errorMessage = ""
  successMessage = ""
  showPassword = false
  showConfirmPassword = false
  token: string | null = null
  email: string | null = null
  slides = [
    {
      title: "Reset Your Password",
      description: "Create a new secure password for your account.",
    },
    {
      title: "Stay Secure",
      description: "Use a strong password that you don't use elsewhere.",
    },
    {
      title: "Almost Done",
      description: "After resetting, you'll be able to log in with your new password.",
    },
  ]
  currentSlide = 0

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params["token"] || null
      this.email = params["email"] || null

      if (!this.token || !this.email) {
        this.errorMessage = "Invalid or expired password reset link."
        this.notificationService.showError(this.errorMessage)
      }
    })

    this.startSlideRotation()
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.get("password")
    const confirmPassword = control.get("confirmPassword")

    if (!password || !confirmPassword) {
      return null
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    } else {
      confirmPassword.setErrors(null)
    }
    return null
  }

  togglePasswordVisibility(field: string): void {
    if (field === "password") {
      this.showPassword = !this.showPassword
    } else if (field === "confirmPassword") {
      this.showConfirmPassword = !this.showConfirmPassword
    }
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token || !this.email) {
      this.errorMessage = "Please fill all fields correctly and ensure a valid token is provided."
      this.markFormGroupTouched(this.resetPasswordForm)
      this.notificationService.showWarning(this.errorMessage)
      return
    }

    this.isLoading = true
    this.errorMessage = ""
    this.successMessage = ""

    const request: ResetPasswordRequest = {
      password: this.resetPasswordForm.value.password,
      email: this.email,
      token: this.token,
    }

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.successMessage = "Your password has been reset successfully."
        this.notificationService.showSuccess(this.successMessage)
        setTimeout(() => {
          this.router.navigate(["/auth/login"])
        }, 3000)
      },
      error: (error) => {
        this.errorMessage = error.message || "Failed to reset password. Please try again."
        this.notificationService.showError(this.errorMessage)
        this.isLoading = false
      },
      complete: () => {
        this.isLoading = false
      },
    })
  }

  goToSlide(index: number): void {
    this.currentSlide = index
  }

  private startSlideRotation(): void {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length
    }, 5000)
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup)
      }
    })
  }
}
