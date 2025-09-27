export interface Conversation {
  id: string;
  title?: string;
  participants: string[];
  lastMessage?: string;
  unreadCount?: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed' | 'read';
}
