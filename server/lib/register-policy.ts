export function isPublicRegisterEnabled(): boolean {
  if (process.env.ALLOW_PUBLIC_REGISTER === 'true') return true;
  if (process.env.ALLOW_PUBLIC_REGISTER === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}
