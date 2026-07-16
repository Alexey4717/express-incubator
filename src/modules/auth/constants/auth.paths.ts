export const AUTH_PATH = '/api/auth' as const;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REFRESH_TOKEN: '/refresh-token',
  REGISTRATION: '/registration',
  REGISTRATION_CONFIRMATION: '/registration-confirmation',
  PASSWORD_RECOVERY: '/password-recovery',
  NEW_PASSWORD: '/new-password',
  REGISTRATION_EMAIL_RESENDING: '/registration-email-resending',
  LOGOUT: '/logout',
  ME: '/me',
} as const;
