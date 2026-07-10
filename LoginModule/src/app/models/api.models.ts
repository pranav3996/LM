// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  accessToken: string;
  refreshToken: string;
  role: string;
  email: string;
  expirationAccessTokenTime: string;
  expirationRefreshTokenTime: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ── User / Admin ──────────────────────────────────────────────────────────────
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  city?: string;
  enabled?: boolean;
}

export interface UserRecord extends UserData {
  id: string;
}

export interface UserResponse {
  statusCode: number;
  message: string;
  users?: UserRecord;      // single-user endpoints (get-by-id, get-profile)
  usersList?: UserRecord[]; // list endpoint
}

// Profile endpoint returns UserResponse shape (with .users nested)
export type ProfileResponse = UserResponse;

export interface ApiResponse {
  statusCode: number;
  message: string;
  status?: string;
}

// ── File Upload ───────────────────────────────────────────────────────────────
export interface UploadProgressEvent {
  status: 'progress';
  message: number;
}

export interface UploadSuccessEvent {
  status: 'success';
  message: string;
  body: ApiResponse;
}

export interface UploadErrorEvent {
  status: 'error';
  message: string;
  errorCode: number | string;
  details?: object;
  body?: ApiResponse;
}

export type UploadEvent = UploadProgressEvent | UploadSuccessEvent | UploadErrorEvent | undefined;

// ── Password ──────────────────────────────────────────────────────────────────
export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface PasswordResponse {
  statusCode: number;
  message: string;
}
