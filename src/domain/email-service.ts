import type {SendEmailConfirmationMessageInputType} from "./types";
import {emailAdapter} from "../adapters/email-adapter";


export const emailService = {
    async sendEmailConfirmationMessage({
                                           email,
                                           subject,
                                           message
    }: SendEmailConfirmationMessageInputType): Promise<boolean> {
        return await emailAdapter.sendEmail({email, subject, message});
    },

    async sendPasswordRecoveryMessage({
                                          email,
                                          subject,
                                          message
    }: SendEmailConfirmationMessageInputType): Promise<boolean> {
        return await emailAdapter.sendEmail({email, subject, message});
    },
};
