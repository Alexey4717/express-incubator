import {body} from "express-validator";
import {getCorrectIncludesAvailableResolutions} from "../../helpers";


// validations for blog body post and put
export const titleValidation = body('title')
    .isLength({max: 15})
    .withMessage("Max field length shouldn`t be more than 15 symbols");
export const authorValidation = body('author')
    .isLength({max: 500})
    .withMessage("Max field length shouldn`t be more than 500 symbols");
export const availableResolutionsValidation = body('availableResolutions')
    .optional({nullable: true})
    .isArray().withMessage("Field should be an array")
    .notEmpty().withMessage("At least one resolution should be added")
    .custom((value) => !getCorrectIncludesAvailableResolutions(value)).withMessage('Invalid resolution')

export const canBeDownloadedValidation = body('canBeDownloaded')
    .optional({nullable: true})
    .isBoolean({strict: true}).withMessage("Field should be a boolean")
export const minAgeRestrictionValidation = body('minAgeRestriction')
    .optional({nullable: true})
    .isInt({min: 1, max: 18}).withMessage("Field should be number from 1 to 18")
export const publicationDateValidation = body('publicationDate')
    .optional({nullable: true})
    .isISO8601().withMessage("Field should be valid date string")

