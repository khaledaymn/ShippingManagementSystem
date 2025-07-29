import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { NotificationService } from "../../../core/services/notification.service"
import { Role } from "../../../core/models/user"
import { NotificationComponent } from "../../../shared/notification/notification.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NotificationComponent],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  isLoading = false
  errorMessage = ""
  showPassword = false
isAuthenticated = false;
isHasRole = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    })
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole(this.authService.getUserRole())
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm)
      this.notificationService.showWarning("Please enter valid credentials.")
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    }

    this.authService.login(credentials).subscribe({
      next: (user) => {
        if(!!user && !!user?.roleId){
          this.redirectBasedOnRole(user.roleId)
          this.notificationService.showSuccess(`Welcome, ${user.name}!`)
        }
        else
        this.notificationService.showError("Email or password is incorrect.")
      },
      error: (error) => {
        this.errorMessage = error.message || "Email or password is incorrect."
        this.notificationService.showError(this.errorMessage)
        this.isLoading = false
      },
      complete: () => {
        this.isLoading = false
      },
    })
  }

  private redirectBasedOnRole(role: string | null): void {
    if (!role) {
      this.router.navigate(["/"])
      return
    }

    switch (role) {
      case Role.ADMIN:
        this.router.navigate(["/employee/dashboard"])
        break
      case Role.EMPLOYEE:
        this.router.navigate(["/employee/dashboard"])
        break
      case Role.SALES_REPRESENTATIVE:
        this.router.navigate(["/dashboard"])
        break
      case Role.MERCHANT:
        this.router.navigate(["/dashboard"])
        break
      case Role.DELEGATE:
        this.router.navigate(["/dashboard"])
        break
      default:
        this.router.navigate(["/"])
    }
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
