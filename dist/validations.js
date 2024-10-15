"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATIONS = void 0;
exports.Validators = Validators;
exports.validate = validate;
var VALIDATIONS;
(function (VALIDATIONS) {
    VALIDATIONS[VALIDATIONS["REQUIRED"] = 0] = "REQUIRED";
    VALIDATIONS[VALIDATIONS["VALID_NAME"] = 1] = "VALID_NAME";
    VALIDATIONS[VALIDATIONS["POSITIVE_LENGTH"] = 2] = "POSITIVE_LENGTH";
    VALIDATIONS[VALIDATIONS["ISNUMBER"] = 3] = "ISNUMBER";
})(VALIDATIONS || (exports.VALIDATIONS = VALIDATIONS = {}));
function required(value) {
    return value.toString().trim().length > 0;
}
function positiveLength(value) {
    return typeof value === 'string' ? Number(value.trim()) > 0 : value > 0;
}
function validName(value) {
    return /^[a-zA-Z]+$/.test(value);
}
function isNumber(value) {
    return !isNaN(Number(value.toString()));
}
const VALIDATION_ERRORS = {
    [VALIDATIONS.REQUIRED]: 'This field is required',
    [VALIDATIONS.VALID_NAME]: 'Please enter a valid name',
    [VALIDATIONS.POSITIVE_LENGTH]: 'Please enter a positive number',
    [VALIDATIONS.ISNUMBER]: 'Please enter a valid number'
};
const VALIDATION_FUNC_MAPPINGS = {
    [VALIDATIONS.REQUIRED]: required,
    [VALIDATIONS.POSITIVE_LENGTH]: positiveLength,
    [VALIDATIONS.VALID_NAME]: validName,
    [VALIDATIONS.ISNUMBER]: isNumber
};
const validators = {};
// Decorator function
function Validators(...args) {
    return function (target, propName) {
        validators[target.constructor.name] = Object.assign(Object.assign({}, validators[target.constructor.name]), { [propName]: args });
    };
}
function validate(obj) {
    const objValidatorConfig = validators[obj.constructor.name];
    if (!objValidatorConfig)
        return { isValid: true, errors: [] };
    let errors = [];
    let isValid = true;
    for (const prop in objValidatorConfig) {
        for (const validator of objValidatorConfig[prop]) {
            const validationFunc = VALIDATION_FUNC_MAPPINGS[validator];
            if (validationFunc(obj[prop])) {
                isValid = isValid && true;
            }
            else {
                isValid = isValid && false;
                errors.push(`${VALIDATION_ERRORS[validator]}: ${prop}`);
                break;
            }
        }
    }
    return {
        isValid,
        errors
    };
}
//# sourceMappingURL=validations.js.map