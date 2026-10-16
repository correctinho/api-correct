export interface SendTargetedMegaPromotionPushInput {
  productUuid: string;
  maxDistanceKm?: number;
}

export interface SendTargetedMegaPromotionPushOutput {
  success: boolean;
  productName: string | null;
  notifiedCount: number;
  notificationId?: string;
  message?: string;
}
