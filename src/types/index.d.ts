import {RequestContextType} from "./common";


declare global {
    declare namespace Express {
        export interface Request {
            context: RequestContextType
        }
    }
}
