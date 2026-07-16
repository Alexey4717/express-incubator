import {Request, Response, NextFunction} from 'express';
import {constants} from "http2";


type ConnectionType = {
    ip: string
    url: string
    method: string
    connectionDate: number
}

let connections: ConnectionType[] = [];

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const now = +new Date();
    const blockInterval = 10 * 1000;

    const ip = req.ip;
    const url = req.originalUrl;
    const method = req.method;

    connections.push({
        ip,
        url,
        method,
        connectionDate: now
    });

    const connectionSessions = connections
        .filter(c => (
            c.ip === ip &&
            c.url === url &&
            c.method === method &&
            ((now - c.connectionDate) <= blockInterval)
        ));

    const connectionsCount = connectionSessions.length

    if (connectionsCount > 5) {
        res.sendStatus(constants.HTTP_STATUS_TOO_MANY_REQUESTS);
        return;
    }

    next();
}

// Попробовать через cron запускать каждые 10 секунд метод по очистке
// https://www.npmjs.com/package/node-cron
