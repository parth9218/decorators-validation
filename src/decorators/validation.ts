namespace App {
      interface Validatable {
            required?: boolean;
            isNumber?: boolean;
            minLength?: number;
            maxLength?: number;
            min?: number;
            max?: number;
      }

      interface ValidationConfig {
            [className: string]: {
                  [property: string]: Validatable;
            }
      }

      export interface ValidationResult {
            isValid: boolean;
            errors: string[];
      }

      interface LabelPropMapping {
            [prop: string]: string;
      }
      const globalValidationConfig: ValidationConfig = {};

      export function Validator(validatable: Validatable) {
            return function (target: any, propertyName: string) {
                  globalValidationConfig[target.constructor.name] = {
                        ...globalValidationConfig[target.constructor.name],
                        [propertyName]: validatable
                  };
            }
      }

      export function validate(obj: any, getValue?: (value: HTMLInputElement) => string, getLabel?: LabelPropMapping): ValidationResult {
            const objConfig = globalValidationConfig[obj.constructor.name];
            let isValid = true;
            let errors: string[] = [];
            if (!objConfig) {
                  return {
                        isValid,
                        errors
                  }
            }
            for (const property in objConfig) {
                  const validators: Validatable | null = objConfig[property];
                  if (validators !== null) {
                        const propValue = getValue && typeof getValue === 'function' ? getValue(obj[property]).trim() : obj[property].toString().trim();
                        const propertyLabel = getLabel && typeof getLabel === 'object' ? getLabel[property] : property;
                        if (validators.required) {
                              isValid = isValid && !!propValue;
                              if (!propValue) {
                                    errors.push(`${propertyLabel} is required`);
                                    continue;
                              }
                        }
                        if (validators.minLength) {
                              isValid = isValid && propValue.length >= validators.minLength;
                              if (propValue.length < validators.minLength) {
                                    errors.push(`${propertyLabel} should be greater than ${validators.minLength}`);
                                    continue;
                              }
                        }
                        if (validators.maxLength) {
                              isValid = isValid && propValue.length <= validators.maxLength;
                              if (propValue.length > validators.maxLength) {
                                    errors.push(`${propertyLabel} should be less than ${validators.maxLength}`);
                                    continue;
                              }
                        }
                        if (validators.isNumber) {
                              isValid = isValid && !isNaN(Number(propValue));
                              if (isNaN(Number(propValue))) {
                                    errors.push(`${propertyLabel} should be a number`);
                                    continue;
                              }
                        }
                        if (validators.min) {
                              isValid = isValid && Number(propValue) >= validators.min;
                              if (Number(propValue) < validators.min) {
                                    errors.push(`${propertyLabel} should be greater than ${validators.min}`);
                                    continue;
                              }
                        }
                        if (validators.max) {
                              isValid = isValid && Number(propValue) <= validators.max;
                              if (Number(propValue) > validators.max) {
                                    errors.push(`${propertyLabel} should be less than ${validators.max}`);
                                    continue;
                              }
                        }
                  }
            }
            return {
                  isValid,
                  errors
            }
      }

}