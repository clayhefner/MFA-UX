import type { LoginCredentials, AuthResponse, User, SSOProvider } from '../types/auth';

// Mock users database - indexed by email
const mockUsers: Record<string, { password: string; user: User; mfaFailureMode?: boolean; isWithinGracePeriod?: boolean }> = {
  'demo@example.com': {
    password: 'password123',
    user: {
      id: '1',
      username: 'demo',
      email: 'demo@example.com',
      mfaEnabled: false
    },
    isWithinGracePeriod: true // Can skip MFA setup
  },
  'admin@example.com': {
    password: 'admin123',
    user: {
      id: '2',
      username: 'admin',
      email: 'admin@example.com',
      mfaEnabled: true
    }
  },
  'locked@example.com': {
    password: 'locked123',
    user: {
      id: '3',
      username: 'locked',
      email: 'locked@example.com',
      mfaEnabled: true
    },
    mfaFailureMode: true // This user will fail MFA after 3 attempts
  },
  'nograce@example.com': {
    password: 'nograce123',
    user: {
      id: '4',
      username: 'nograce',
      email: 'nograce@example.com',
      mfaEnabled: false
    },
    isWithinGracePeriod: false // Cannot skip MFA setup - mandatory
  }
};

// Mock MFA secret for demonstration
const MOCK_MFA_SECRET = 'JBSWY3DPEHPK3PXP';

class AuthService {
  private currentUser: User | null = null;
  private pendingMFAUser: User | null = null;
  private mfaAttempts: number = 0;
  private pendingMFAFailureMode: boolean = false;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await this.delay(500);

    const userRecord = mockUsers[credentials.username];

    if (!userRecord || userRecord.password !== credentials.password) {
      return {
        success: false,
        requiresMFA: false,
        message: 'Invalid username or password'
      };
    }

    // If user has MFA enabled, check if device is trusted
    if (userRecord.user.mfaEnabled) {
      // Check for trusted device (user-specific token)
      const trustTokenKey = `mfa_trust_token_${userRecord.user.id}`;
      const trustExpiryKey = `mfa_trust_expiry_${userRecord.user.id}`;
      const trustToken = localStorage.getItem(trustTokenKey);
      const trustExpiry = localStorage.getItem(trustExpiryKey);

      if (trustToken && trustExpiry) {
        const expiryDate = new Date(trustExpiry);
        const now = new Date();

        if (expiryDate > now) {
          // Device is trusted and token hasn't expired
          this.currentUser = userRecord.user;
          return {
            success: true,
            requiresMFA: false,
            user: userRecord.user,
            token: this.generateMockToken(userRecord.user),
            message: 'Logged in with trusted device'
          };
        } else {
          // Token expired, clear it
          localStorage.removeItem(trustTokenKey);
          localStorage.removeItem(trustExpiryKey);
        }
      }

      // Device not trusted or token expired, require MFA verification
      this.pendingMFAUser = userRecord.user;
      this.mfaAttempts = 0;
      this.pendingMFAFailureMode = userRecord.mfaFailureMode || false;
      return {
        success: true,
        requiresMFA: true,
        message: 'Please enter your MFA code'
      };
    }

    // If no MFA, check if user needs to set up MFA
    if (!userRecord.user.mfaEnabled) {
      this.currentUser = userRecord.user;
      return {
        success: true,
        requiresMFA: false,
        requiresMFASetup: true,
        isWithinGracePeriod: userRecord.isWithinGracePeriod ?? true,
        user: userRecord.user,
        token: this.generateMockToken(userRecord.user),
        message: userRecord.isWithinGracePeriod === false
          ? 'MFA setup is required to continue'
          : 'Please set up MFA for enhanced security'
      };
    }

    // If MFA already enabled, login successful
    this.currentUser = userRecord.user;
    return {
      success: true,
      requiresMFA: false,
      user: userRecord.user,
      token: this.generateMockToken(userRecord.user)
    };
  }

  async loginWithSSO(provider: SSOProvider): Promise<AuthResponse> {
    // Simulate API delay
    await this.delay(1000);

    // Mock SSO login - in reality this would redirect to OAuth provider
    const mockSSOUser: User = {
      id: `sso-${provider}-123`,
      username: `${provider}_user`,
      email: `user@${provider}.com`,
      mfaEnabled: false
    };

    this.currentUser = mockSSOUser;

    return {
      success: true,
      requiresMFA: false,
      user: mockSSOUser,
      token: this.generateMockToken(mockSSOUser)
    };
  }

  async setupMFA(): Promise<AuthResponse> {
    // Simulate API delay
    await this.delay(300);

    if (!this.currentUser) {
      return {
        success: false,
        requiresMFA: false,
        message: 'No user logged in'
      };
    }

    // Generate QR code URL for authenticator apps
    const qrCodeUrl = this.generateQRCodeUrl(this.currentUser.email, MOCK_MFA_SECRET);

    return {
      success: true,
      requiresMFA: false,
      mfaSetup: {
        secret: MOCK_MFA_SECRET,
        qrCode: qrCodeUrl
      }
    };
  }

  async verifyMFA(code: string): Promise<AuthResponse> {
    // Simulate API delay
    await this.delay(500);

    if (!this.pendingMFAUser) {
      return {
        success: false,
        requiresMFA: false,
        message: 'No pending MFA verification'
      };
    }

    this.mfaAttempts++;

    // Check if in failure mode and attempts exceeded
    if (this.pendingMFAFailureMode && this.mfaAttempts >= 3) {
      const email = this.pendingMFAUser.email;
      this.pendingMFAUser = null;
      this.mfaAttempts = 0;
      this.pendingMFAFailureMode = false;

      return {
        success: false,
        requiresMFA: false,
        message: `Account temporarily locked due to multiple failed MFA attempts. Please reset your password or contact support. A verification link has been sent to ${email}.`
      };
    }

    // Mock verification - in reality, this would verify the TOTP code
    // For demo purposes, accept '123456' or any 6-digit code
    // But always fail for accounts in failure mode
    if (!this.pendingMFAFailureMode && code.length === 6 && /^\d+$/.test(code)) {
      this.currentUser = this.pendingMFAUser;
      this.pendingMFAUser = null;
      this.mfaAttempts = 0;

      return {
        success: true,
        requiresMFA: false,
        user: this.currentUser,
        token: this.generateMockToken(this.currentUser)
      };
    }

    const remainingAttempts = this.pendingMFAFailureMode ? 3 - this.mfaAttempts : null;
    const message = remainingAttempts !== null && remainingAttempts > 0
      ? `Invalid MFA code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
      : 'Invalid MFA code';

    return {
      success: false,
      requiresMFA: true,
      message
    };
  }

  async enableMFA(code: string): Promise<AuthResponse> {
    // Simulate API delay
    await this.delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        requiresMFA: false,
        message: 'No user logged in'
      };
    }

    // Mock verification of setup code
    if (code.length === 6 && /^\d+$/.test(code)) {
      this.currentUser.mfaEnabled = true;

      // Update mock database
      const userRecord = Object.values(mockUsers).find(
        record => record.user.id === this.currentUser?.id
      );
      if (userRecord) {
        userRecord.user.mfaEnabled = true;
      }

      return {
        success: true,
        requiresMFA: false,
        user: this.currentUser,
        message: 'MFA enabled successfully'
      };
    }

    return {
      success: false,
      requiresMFA: false,
      message: 'Invalid verification code'
    };
  }

  logout(): void {
    this.currentUser = null;
    this.pendingMFAUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private generateMockToken(user: User): string {
    return `mock-jwt-token-${user.id}-${Date.now()}`;
  }

  private generateQRCodeUrl(email: string, secret: string): string {
    const issuer = 'MFA PoC App';
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const authService = new AuthService();
