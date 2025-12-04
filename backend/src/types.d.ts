import { IUser } from './models/User';

declare global {
    namespace Express {
        interface Request {
            user?: any; // Using any to avoid strict type issues with Passport vs JWT payload
        }
    }
}
