export {}

// Create a type for the Roles
export type Roles =  'super admin' |'admin' | 'moderator' | 'user';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}