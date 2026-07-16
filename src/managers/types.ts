import {GetUserOutputModelFromMongoDB} from "../models/UserModels/GetUserOutputModel";


export type SendEmailConfirmationMessageInputType = {
    user: GetUserOutputModelFromMongoDB
    confirmationCode?: string
};


