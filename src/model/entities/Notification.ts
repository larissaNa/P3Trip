export interface Notification {
  id: string;
  title: string;
  message: string;
  receivedAt: string;
  icon: string;
}

export interface NotificationEntity {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  data?: any;
}

