# 🏦 STB Backend — Enterprise Banking Auth API

NestJS + MongoDB backend with enterprise-grade authentication for the STB Mobile application.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env   # Fill in MongoDB URI + SMTP
npm run start:dev
```

**Server:** `http://localhost:3000`  
**Swagger Docs:** `http://localhost:3000/docs`

---

## 🔐 Auth Flow

```
First Time: Matricule+CIN+DOB → OTP → Password → PIN → Face ID → Dashboard
Login:      Matricule+Password → JWT (15m) + Refresh (30d)
Biometric:  Trusted Device → Face ID / Fingerprint → Dashboard
Fallback:   Face ID fails → Fingerprint → PIN → Password
```

## 📡 Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/activate/request` | POST | Step 1: Send OTP |
| `/api/v1/auth/activate/verify-otp` | POST | Step 2: Verify OTP |
| `/api/v1/auth/activate/set-password` | POST | Step 3: Create password |
| `/api/v1/auth/activate/set-pin` | POST | Step 4: Create PIN |
| `/api/v1/auth/activate/enable-biometrics` | POST | Step 5: Enable biometrics |
| `/api/v1/auth/login` | POST | Matricule + Password → JWT |
| `/api/v1/auth/login/biometric` | POST | Face ID / Fingerprint |
| `/api/v1/auth/login/pin` | POST | PIN fallback |
| `/api/v1/auth/token/refresh` | POST | Refresh token |
| `/api/v1/auth/logout` | POST | Revoke session |
| `/api/v1/auth/password/forgot` | POST | Request reset OTP |
| `/api/v1/auth/password/reset` | POST | Reset with OTP |
| `/api/v1/devices` | GET/DELETE | Manage trusted devices |
| `/api/v1/sessions` | GET/DELETE | Manage active sessions |
| `/api/v1/employees` | POST/GET | RH: Create/list employees |
| `/api/v1/audit/my-logs` | GET | My activity audit trail |

## 🔒 Security

- BCrypt (12 rounds) for passwords and PINs
- OTP: hashed, 5-min TTL, max 5 attempts
- Account lockout: 5 failed attempts → 30 min lock
- JWT rotation on refresh
- Device fingerprinting (UUID)
- Full audit trail on every action

## 🏷️ Roles

`EMPLOYEE` → `RH` → `MANAGER` → `FINANCE` → `ADMIN` → `SUPER_ADMIN`
