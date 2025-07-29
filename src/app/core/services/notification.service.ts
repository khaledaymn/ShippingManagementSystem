import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { NotificationConfig, NotificationToast } from "../models/notification";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private readonly _notifications$ = new BehaviorSubject<NotificationToast[]>([]);
  readonly notifications$: Observable<NotificationToast[]> = this._notifications$.asObservable();
  private timers: Map<string, { timeout: any; remaining: number }> = new Map();

  constructor() {}

  showSuccess(message: string, duration = 5000, persistent = false): void {
    this.addNotification({ message, type: "success", duration, persistent });
  }

  showError(message: string, duration = 8000, persistent = false): void {
    this.addNotification({ message, type: "error", duration, persistent });
  }

  showWarning(message: string, duration = 6000, persistent = false): void {
    this.addNotification({ message, type: "warning", duration, persistent });
  }

  showInfo(message: string, duration = 5000, persistent = false): void {
    this.addNotification({ message, type: "info", duration, persistent });
  }

  showNotification(config: NotificationConfig): void {
    this.addNotification(config);
  }

  removeNotification(id: string): void {
    const currentNotifications = this._notifications$.value;
    const updatedNotifications = currentNotifications.filter((n) => n.id !== id);
    this._notifications$.next(updatedNotifications);
    this.clearTimer(id);
  }

  clearAll(): void {
    this._notifications$.value.forEach((n) => this.clearTimer(n.id));
    this._notifications$.next([]);
  }

  clearByType(type: NotificationToast["type"]): void {
    const currentNotifications = this._notifications$.value;
    const updatedNotifications = currentNotifications.filter((n) => n.type !== type);
    updatedNotifications.forEach((n) => this.clearTimer(n.id));
    this._notifications$.next(updatedNotifications);
  }

  getNotificationCount(): number {
    return this._notifications$.value.length;
  }

  getNotificationCountByType(type: NotificationToast["type"]): number {
    return this._notifications$.value.filter((n) => n.type === type).length;
  }

  pauseNotification(id: string): void {
    const timer = this.timers.get(id);
    if (timer && timer.timeout) {
      clearTimeout(timer.timeout);
      timer.remaining = timer.remaining - (Date.now() - timer.timeout._idleStart);
      this.timers.set(id, { ...timer, timeout: null });
    }
  }

  resumeNotification(id: string): void {
    const timer = this.timers.get(id);
    if (timer && !timer.timeout && timer.remaining > 0) {
      const timeout = setTimeout(() => this.removeNotification(id), timer.remaining);
      this.timers.set(id, { timeout, remaining: timer.remaining });
    }
  }

  private addNotification(config: NotificationConfig): void {
    const notification: NotificationToast = {
      id: this.generateId(),
      message: config.message,
      type: config.type,
      duration: config.duration ?? 5000,
      persistent: config.persistent ?? false,
    };

    const currentNotifications = this._notifications$.value;
    this._notifications$.next([...currentNotifications, notification]);

    if (!notification.persistent && notification.duration > 0) {
      const timeout = setTimeout(() => this.removeNotification(notification.id), notification.duration);
      this.timers.set(notification.id, { timeout, remaining: notification.duration });
    }
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer && timer.timeout) {
      clearTimeout(timer.timeout);
      this.timers.delete(id);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
