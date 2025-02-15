import { Request } from 'express';
import { Session } from './session.interface';

export interface RequestWithSession extends Request {
  session: Session;
}
