# MFA Login Flow - Proof of Concept

A React-based login flow with Multi-Factor Authentication (MFA) using Ant Design components. This is a demonstration project with mock authentication and QR code generation for MFA setup.

## Features

- **Login Page**: Username/password authentication with SSO buttons for Google and Microsoft
- **MFA Verification**: 6-digit code verification for users with MFA enabled
- **MFA Setup**: Step-by-step wizard to enable MFA with QR code scanning
- **Dashboard**: Protected route showing user information and MFA status
- **Mock Authentication**: Fully functional mock service for demonstration purposes

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Ant Design (antd) for UI components
- React Router for navigation
- qrcode.react for QR code generation

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Demo Credentials

### User without MFA
- **Username**: demo
- **Password**: password123

This user does not have MFA enabled and will be logged in directly to the dashboard.

### User with MFA
- **Username**: admin
- **Password**: admin123

This user has MFA enabled and will be prompted to enter a 6-digit code. For the demo, any 6-digit code (e.g., `123456`) will work.

### SSO Login
Click on "Sign in with Google" or "Sign in with Microsoft" to simulate SSO authentication. This will create a mock SSO user and log them in directly.

## Application Flow

### 1. Login
- Enter credentials or use SSO buttons
- If credentials are invalid, an error message is displayed
- If MFA is enabled for the user, redirect to MFA verification
- If MFA is not enabled, redirect to dashboard

### 2. MFA Verification
- Enter 6-digit code from authenticator app
- For demo purposes, any 6-digit number works
- On success, redirect to dashboard
- Can go back to login page

### 3. Dashboard
- Displays user information
- Shows MFA status
- If MFA is not enabled, shows a prompt to enable it
- Can logout to return to login page

### 4. MFA Setup
- Three-step wizard:
  1. **Introduction**: Explains MFA and requirements
  2. **QR Code Scanning**: Shows QR code and manual entry code
  3. **Verification**: Enter code to confirm setup
- On completion, MFA is enabled for the account

## Project Structure

```
src/
├── components/
│   └── OtpInput.tsx          # Reusable OTP input component
├── pages/
│   ├── LoginPage.tsx         # Main login page
│   ├── MFAVerifyPage.tsx     # MFA code verification
│   ├── MFASetupPage.tsx      # MFA setup wizard
│   └── DashboardPage.tsx     # Protected dashboard
├── services/
│   └── authService.ts        # Mock authentication service
├── types/
│   └── auth.ts               # TypeScript interfaces
├── App.tsx                   # Main app with routing
└── main.tsx                  # Entry point
```

## Mock Authentication Service

The `authService.ts` provides a mock implementation of:
- Username/password login
- SSO authentication
- MFA verification
- MFA setup and enablement
- Session management

In a production application, these would be replaced with actual API calls to your backend.

## QR Code Generation

The MFA setup generates a QR code using the TOTP (Time-based One-Time Password) URI format:

```
otpauth://totp/MFA%20PoC%20App:user@example.com?secret=SECRET&issuer=MFA%20PoC%20App
```

This can be scanned by authenticator apps like:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password

## Styling

The application uses:
- Ant Design's component library and theming
- Custom inline styles for layout
- Purple gradient background for authentication pages
- Responsive design for mobile and desktop

## Security Notes

This is a **proof of concept** and includes several simplifications:

- Passwords are stored in plain text in memory
- MFA codes accept any 6-digit number
- No actual TOTP verification
- No session persistence
- No CSRF protection
- No rate limiting

For production use, you would need:
- Secure password hashing (bcrypt, argon2)
- Real TOTP verification with time-based validation
- Secure session management with HTTP-only cookies
- HTTPS enforcement
- Rate limiting and brute force protection
- Proper error handling and logging
- Backend API integration

## License

MIT
