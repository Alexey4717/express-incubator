export type NewPasswordInputModel = {
    /**
     * Set code for change new password by email.
     */
    recoveryCode: string

    /**
     * Set new password. Min length - 6, max length - 20 symbols.
     */
    newPassword: string
};
