import * as dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

import {SendEmailInputType} from './types';


export const emailAdapter = {
    async sendEmail({email, subject, message}: SendEmailInputType): Promise<boolean> {
        try {
            const user = process.env.NODEMAILER_USER_TRANSPORT;
            const pass = process.env.NODEMAILER_PASSWORD_TRANSPORT;

            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {user, pass}
            });

            await transport.sendMail({
                from: `Alexey <${user}>`,
                to: email,
                subject,
                html: message
            });

            return true;
        } catch (error) {
            console.error(`emailAdapter.sendEmail error is occurred: ${error}`);
            return false;
        }
    }
};
