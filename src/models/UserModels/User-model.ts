import {model, Schema} from "mongoose";

import {GetUserOutputModel} from "./GetUserOutputModel";


const UserSchema = new Schema<GetUserOutputModel>({
    accountData: {
        login: {type: String, required: true},
        email: {type: String, required: true},
        passwordHash: {type: String, required: true},
        createdAt: {type: String, required: true},
    },
    emailConfirmation: {
        confirmationCode: {type: String, required: true},
        expirationDate: {type: Date, required: true},
        isConfirmed: {type: Boolean, required: true},
    },
    recoveryData: {
        recoveryCode: {type: String, required: true},
        expirationDate: {type: Date, required: true},
    },
});

export default model("User", UserSchema);