export interface SessionIdentity {
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly emailVerified: boolean;
    readonly username: string | null;
    readonly image: string | null;
  };
  readonly session: {
    readonly id: string;
    readonly expiresAt: Date;
  };
}
