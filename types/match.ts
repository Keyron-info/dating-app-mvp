import { Profile } from "./profile";

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
}

export interface MatchWithPartner extends Match {
  partner: Profile;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

