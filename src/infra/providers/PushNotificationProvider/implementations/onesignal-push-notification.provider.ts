import axios from 'axios';
import {
  IPushNotificationProvider,
  SendPushNotificationInput,
  SendPushNotificationResult,
} from '../push-notification.provider';

export class OneSignalPushNotificationProvider implements IPushNotificationProvider {
  private appId: string;
  private apiKey: string;

  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID || '';
    this.apiKey = process.env.ONESIGNAL_REST_API_KEY || '';
  }

  async sendPushNotification(
    input: SendPushNotificationInput
  ): Promise<SendPushNotificationResult> {
    const { userIds, sendToAll, title, message, data, url } = input;

    if (!this.appId || !this.apiKey) {
      console.warn(
        '[OneSignalPushNotificationProvider] ONESIGNAL_APP_ID ou ONESIGNAL_REST_API_KEY não configurados.'
      );
      return { success: false, error: 'Credenciais OneSignal ausentes' };
    }

    if (!sendToAll && (!userIds || userIds.length === 0)) {
      return { success: false, error: 'Nenhum usuário informado para notificação' };
    }

    try {
      const payload: Record<string, any> = {
        app_id: this.appId,
        target_channel: 'push',
        headings: {
          pt: title,
          en: title,
        },
        contents: {
          pt: message,
          en: message,
        },
      };

      if (sendToAll) {
        payload.included_segments = ['Total Subscriptions'];
      } else if (userIds && userIds.length > 0) {
        payload.include_aliases = {
          external_id: userIds,
        };
      }

      if (data) {
        payload.data = data;
      }

      if (url) {
        payload.url = url;
      }

      const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        payload,
        {
          headers: {
            Authorization: `Basic ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        notificationId: response.data?.id,
        recipients: response.data?.recipients || 0,
      };
    } catch (err: any) {
      console.error(
        '[OneSignalPushNotificationProvider] Erro ao enviar notificação OneSignal:',
        err.response?.status,
        err.response?.data || err.message
      );

      return {
        success: false,
        error: err.response?.data?.errors?.[0] || err.message,
      };
    }
  }
}
