import { RequestContextType } from './request-context';

declare global {
  declare namespace Express {
    export interface Request {
      context: RequestContextType;
    }
  }
}
