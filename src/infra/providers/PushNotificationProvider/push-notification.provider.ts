export interface SendPushNotificationInput {
  userIds?: string[]; // UUIDs dos usuários (external_id no OneSignal)
  sendToAll?: boolean; // Se true, dispara para todos os aparelhos inscritos
  title: string;
  message: string;
  data?: Record<string, any>;
  url?: string;
}

export interface SendPushNotificationResult {
  success: boolean;
  notificationId?: string;
  recipients?: number;
  error?: string;
}

export interface IPushNotificationProvider {
  sendPushNotification(
    input: SendPushNotificationInput
  ): Promise<SendPushNotificationResult>;
}
