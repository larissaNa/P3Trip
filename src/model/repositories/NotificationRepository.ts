import { NotificationService } from "../services/NotificationService";
import { Notification } from "../entities/Notification";

export class NotificationRepository {
  private service = new NotificationService();

  async getAll(): Promise<Notification[]> {
    const history = await this.service.getNotificationHistory();

    if (!history || history.length === 0) {
      return [];
    }

    return history.map((item) => ({
      id: item.id,
      title: item.title || "Notificação",
      message: item.body,
      receivedAt: item.receivedAt,
      icon: "bell",
    }));
  }
}
