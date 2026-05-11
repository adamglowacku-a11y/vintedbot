export const ADMIN_EMAIL = "adamglowa2008@gmail.com";

export function isAdminEmail(email?: string | null) {
  return email?.toLowerCase() === ADMIN_EMAIL;
}
