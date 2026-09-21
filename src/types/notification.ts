export type NotificationType = 'order' | 'chat_escalation' | 'chat_message';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
};
