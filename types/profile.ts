export interface Profile {
  id: string;
  userId: string;
  nickname: string;
  birthdate: string;
  age: number;
  gender: "male" | "female" | "other";
  interestedIn: ("male" | "female" | "other" | "all")[];
  bio?: string;
  photoUrls: string[];
  isProfileComplete: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

