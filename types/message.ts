export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  readAt?: string;
  createdAt: string;
  isMine?: boolean;
}

