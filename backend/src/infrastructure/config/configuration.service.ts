import { Injectable } from '@nestjs/common';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function port(name: string, fallback: number): number {
  const raw = process.env[name] ?? String(fallback);
  const value = Number(raw);
  if (
    !/^\d+$/.test(raw) ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 65535
  ) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return value;
}

function origin(value: string, name: string): string {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(`${name} must be an HTTP(S) origin`);
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must not contain a path, query or fragment`);
  }
  return url.origin;
}

@Injectable()
export class ConfigurationService {
  readonly port = port('PORT', 3020);
  readonly rpcPrefix = '/rpc/v1' as const;
  readonly authPath = `${this.rpcPrefix}/auth` as const;
  readonly databaseUrl = required('DATABASE_URL');
  readonly authSecret = required('BETTER_AUTH_SECRET');
  readonly authUrl = origin(
    process.env.BETTER_AUTH_URL ?? `http://localhost:${this.port}`,
    'BETTER_AUTH_URL',
  );
  readonly trustedOrigins = [
    ...new Set([
      this.authUrl,
      ...(process.env.TRUSTED_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => origin(value, 'TRUSTED_ORIGINS')),
    ]),
  ];
  readonly googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  readonly googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  readonly smtp = {
    host: process.env.SMTP_HOST?.trim(),
    port: port('SMTP_PORT', 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER?.trim(),
    password: process.env.SMTP_PASSWORD,
    from: process.env.MAIL_FROM ?? 'Backend <no-reply@example.com>',
  };

  constructor() {
    const database = new URL(this.databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(database.protocol)) {
      throw new Error('DATABASE_URL must use PostgreSQL');
    }
    if (this.authSecret.length < 32) {
      throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters');
    }
    if (Boolean(this.googleClientId) !== Boolean(this.googleClientSecret)) {
      throw new Error(
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together',
      );
    }
    if (Boolean(this.smtp.user) !== Boolean(this.smtp.password)) {
      throw new Error(
        'SMTP_USER and SMTP_PASSWORD must be configured together',
      );
    }
    if (
      process.env.SMTP_SECURE &&
      !['true', 'false'].includes(process.env.SMTP_SECURE)
    ) {
      throw new Error('SMTP_SECURE must be true or false');
    }
  }
}
