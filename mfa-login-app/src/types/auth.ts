export interface User {
  id: string;
  username: string;
  email: string;
  mfaEnabled: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
}

export interface AuthResponse {
  success: boolean;
  requiresMFA: boolean;
  requiresMFASetup?: boolean;
  isWithinGracePeriod?: boolean;
  user?: User;
  mfaSetup?: MFASetup;
  token?: string;
  message?: string;
}

export type SSOProvider = 'google' | 'microsoft';
