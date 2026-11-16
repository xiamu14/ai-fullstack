import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { emailOTP, openAPI, username } from 'better-auth/plugins';
import type { ConfigurationService } from '../config/configuration.service.js';
import {
  MailUnavailableError,
  type MailService,
} from '../mail/mail.service.js';
import type { Database } from '../postgres/database.service.js';
import * as authSchema from '../postgres/schema/auth.schema.js';

export function createAuth(
  database: Database,
  configuration: ConfigurationService,
  mail: MailService,
) {
  const socialProviders =
    configuration.googleClientId && configuration.googleClientSecret
      ? {
          google: {
            clientId: configuration.googleClientId,
            clientSecret: configuration.googleClientSecret,
          },
        }
      : {};

  return betterAuth({
    appName: 'Backend',
    telemetry: { enabled: false },
    baseURL: configuration.authUrl,
    basePath: configuration.authPath,
    secret: configuration.authSecret,
    database: drizzleAdapter(database, {
      provider: 'pg',
      schema: authSchema,
    }),
    trustedOrigins: configuration.trustedOrigins,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
    },
    socialProviders,
    user: { modelName: 'auth_user' },
    session: {
      modelName: 'auth_session',
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    account: { modelName: 'auth_account', encryptOAuthTokens: true },
    verification: { modelName: 'auth_verification' },
    advanced: {
      cookiePrefix: 'backend',
      useSecureCookies: new URL(configuration.authUrl).protocol === 'https:',
    },
    rateLimit: { enabled: true, window: 60, max: 100 },
    plugins: [
      username(),
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        storeOTP: 'hashed',
        sendVerificationOnSignUp: true,
        overrideDefaultEmailVerification: true,
        sendVerificationOTP: async ({ email, otp, type }) => {
          try {
            await mail.sendVerificationOtp(email, otp, type);
          } catch (error) {
            if (error instanceof MailUnavailableError) {
              throw new APIError('SERVICE_UNAVAILABLE', {
                message: error.message,
              });
            }
            throw error;
          }
        },
      }),
      openAPI({ disableDefaultReference: true }),
    ],
  });
}
