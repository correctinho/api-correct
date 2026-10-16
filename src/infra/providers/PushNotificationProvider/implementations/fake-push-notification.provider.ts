import {
  IPushNotificationProvider,
  SendPushNotificationInput,
  SendPushNotificationResult,
} from '../push-notification.provider';

export class FakePushNotificationProvider implements IPushNotificationProvider {
  public sentNotifications: SendPushNotificationInput[] = [];

  async sendPushNotification(
    input: SendPushNotificationInput
  ): Promise<SendPushNotificationResult> {
    this.sentNotifications.push(input);
    return {
      success: true,
      notificationId: 'fake-notification-id-' + Date.now(),
      recipients: input.userIds.length,
    };
  }
}
