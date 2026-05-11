export const REFRESH_SAFETY = {
  cooldownMs: 90_000,
  minDelayMs: 1800,
  maxDelayMs: 4200,
  retryLimit: 2,
  retryBackoffMs: 2500
};

export function getRandomHumanDelay() {
  return Math.floor(Math.random() * (REFRESH_SAFETY.maxDelayMs - REFRESH_SAFETY.minDelayMs + 1)) + REFRESH_SAFETY.minDelayMs;
}

export function isCooldownActive(cooldownUntil?: string) {
  return Boolean(cooldownUntil && new Date(cooldownUntil).getTime() > Date.now());
}

export function secondsUntil(value?: string) {
  if (!value) {
    return 0;
  }

  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 1000));
}
