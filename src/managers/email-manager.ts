import * as dotenv from "dotenv";
dotenv.config();
import {v4 as uuidv4} from 'uuid';

import type {SendEmailConfirmationMessageInputType} from "./types";
import {emailService} from "../domain/email-service";
import {GetUserOutputModelFromMongoDB} from "../models/UserModels/GetUserOutputModel";
import {usersRepository} from "../repositories/CUD-repo/users-repository";
import {add} from "date-fns";


export const emailManager = {
    async sendPasswordRecoveryMessage(email: string): Promise<boolean> {
        const foundUser = await usersRepository.findByLoginOrEmail(email);
        // Even if current email is not registered (for prevent user's email detection)
        if (!foundUser) return true;

        const recoveryData = {
            recoveryCode: uuidv4(),
            expirationDate: add(new Date(), {days: 1}),
        };

        const result = await usersRepository.setUserRecoveryData({userId: foundUser._id, recoveryData});
        // Even if current email is not registered (for prevent user's email detection)
        if (!result) return true;

        return await emailService.sendEmailConfirmationMessage({
            email,
            subject: 'Password recovery',
            message: `
                <h1>Password recovery</h1>
                <p>To finish password recovery please follow the link below:
                    <a href='${process.env.MAIN_URL}/password-recovery?recoveryCode=${recoveryData.recoveryCode}'>
                        recovery password
                    </a>
                </p>
            `,
        });
    },

    async sendEmailConfirmationMessage({user, confirmationCode}: SendEmailConfirmationMessageInputType): Promise<boolean> {
        if (confirmationCode) {
            const result = await usersRepository.updateUserConfirmationCode({
                userId: user._id,
                newCode: confirmationCode
            });
            if (!result) return false;
        }

        return await emailService.sendPasswordRecoveryMessage({
            email: user.accountData.email,
            subject: 'Registration confirmation',
            message: `
                <p>To confirm registration please follow the link below:
                    <a href='${process.env.MAIN_URL}/confirm-registration?code=${confirmationCode || user.emailConfirmation.confirmationCode}'>
                        confirm registration
                    </a>
                </p>
            `,
        });
    },
};
