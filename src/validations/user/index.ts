import {body} from "express-validator";


// validations for user body post
export const loginValidation = body('login')
    .isLength({min: 3, max: 10})
    .withMessage("Field length should be from 3 to 10 symbols")
    // .custom((value) => /^[a-zA-Z0-9_-]*$/.test(value))
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage("Allowed only a-zA-Z0-9_- symbols");
export const emailValidation = body('email')
    .isEmail()
    .withMessage("Field must be valid email");
export const passwordValidation = body('password')
    .isLength({min: 6, max: 20})
    .withMessage("Field length should be from 6 to 20 symbols");

