export interface NotificationToast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration: number;
  persistent: boolean;
}

export interface NotificationConfig {
  message: string;
  type: NotificationToast["type"];
  duration?: number;
  persistent?: boolean;
}
