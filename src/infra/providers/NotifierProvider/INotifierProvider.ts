export interface INotifierPayload {
  event_type: string;
  data: any;
}

export interface INotifierProvider {
  notify(payload: INotifierPayload): Promise<void>;
}