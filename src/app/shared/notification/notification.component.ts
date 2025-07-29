import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { NotificationToast } from "../../core/models/notification";
import { NotificationService } from "../../core/services/notification.service";

@Component({
  selector: "app-notification",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.css"],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: NotificationToast[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  getNotificationIcon(type: NotificationToast["type"]): string {
    const icons = {
      success: "bi-check-circle",
      error: "bi-exclamation-circle",
      warning: "bi-exclamation-triangle",
      info: "bi-info-circle",
    };
    return icons[type];
  }

  getNotificationClass(type: NotificationToast["type"]): string {
    return `notification-${type}`;
  }

  trackByNotificationId(index: number, notification: NotificationToast): string {
    return notification.id;
  }

  onNotificationClick(notification: NotificationToast): void {
    console.log("Notification clicked:", notification);
    if (!notification.persistent) {
      this.removeNotification(notification.id);
    }
  }

  onNotificationMouseEnter(notification: NotificationToast): void {
    if (!notification.persistent) {
      this.notificationService.pauseNotification(notification.id);
    }
  }

  onNotificationMouseLeave(notification: NotificationToast): void {
    if (!notification.persistent) {
      this.notificationService.resumeNotification(notification.id);
    }
  }
}
