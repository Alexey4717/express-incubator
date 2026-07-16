import {Request, Response, NextFunction} from "express";
import {ObjectId} from "mongodb";
import {constants} from 'http2';


export const paramIdValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // подумать, может стоит убрать мидлвэр, т.к. регулярки вставил в роуты для айдишников
    try {
        // на время сделал костыль на поиск подстроки id,
        // хотя в теории может быть передано слово с таким вхождением, которое не является идентификатором
        const idsEntries = Object.entries(req.params).filter((entry) => {
            const key = entry[0].toLowerCase();
            return key.includes('id');
        });
        const allIdsIsValid = idsEntries.every((entry) => ObjectId.isValid(entry[1]));
        if (!allIdsIsValid) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }
        next();
    } catch (error) {
        console.log(`URI params Id validation error: ${error}`)
    }
};
