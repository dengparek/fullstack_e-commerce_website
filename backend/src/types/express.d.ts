import type { AuthenticatedUser } from "./auth";
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
