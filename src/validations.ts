export enum VALIDATIONS {
      REQUIRED = "REQUIRED",
      VALID_NAME = "VALID_NAME",
      POSITIVE_LENGTH = "POSITIVE_LENGTH",
      ISNUMBER = "ISNUMBER"
}

type validationFunc = (value: string | number) => boolean;

type ValidationFuncMappings = {
      [prop in VALIDATIONS]: validationFunc;
};

function required(value: string | number) {
      return value.toString().trim().length > 0;
}

function positiveLength(value: string | number) {
      return typeof value === 'string' ? Number(value.trim()) > 0 : value > 0;
}

function validName(value: string | number) {
      return /^[a-zA-Z]+$/.test(value.toString());
}

function isNumber(value: string | number) {
      return !isNaN(Number(value.toString()));
}

const VALIDATION_ERRORS = {
      [VALIDATIONS.REQUIRED]: 'This field is required',
      [VALIDATIONS.VALID_NAME]: 'Please enter a valid name',
      [VALIDATIONS.POSITIVE_LENGTH]: 'Please enter a positive number',
      [VALIDATIONS.ISNUMBER]: 'Please enter a valid number'
}

const VALIDATION_FUNC_MAPPINGS: ValidationFuncMappings = {
      [VALIDATIONS.REQUIRED]: required,
      [VALIDATIONS.POSITIVE_LENGTH]: positiveLength,
      [VALIDATIONS.VALID_NAME]: validName,
      [VALIDATIONS.ISNUMBER]: isNumber
}

interface ValidatorConfig {
      [prop: string]: {
            [propName: string]: VALIDATIONS[];
      }
}

const validators: ValidatorConfig = {};


// Decorator function
export function Validators(...args: VALIDATIONS[]) {
      return function (target: any, propName: string) {
            validators[target.constructor.name] = {
                  ...validators[target.constructor.name],
                  [propName]: args
            }
      }
}

export interface ValidationResult {
      isValid: boolean,
      errors: string[]
}

export function validate(obj: any): ValidationResult {
      const objValidatorConfig = validators[obj.constructor.name];
      if (!objValidatorConfig) return { isValid: true, errors: [] };
      let errors = [];

      let isValid = true;
      for (const prop in objValidatorConfig) {
            for (const validator of objValidatorConfig[prop]) {
                  const validationFunc = VALIDATION_FUNC_MAPPINGS[validator];
                  if (validationFunc(obj[prop])) {
                        isValid = isValid && true;
                  } else {
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