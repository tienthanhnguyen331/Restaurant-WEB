export interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar?: string;
  role?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
