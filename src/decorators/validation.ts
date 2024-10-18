interface Validatable {
      required?: boolean;
      isNumber?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
}

interface ValidatablePropsConfig {
      [property: string]: Validatable
}

interface ValidationConfig {
      [className: string]: {
            __classRef: any,
            validatableProps: ValidatablePropsConfig;
      }[]
}

export interface ValidationResult {
      isValid: boolean;
      errors: string[];
}

interface LabelPropMapping {
      [prop: string]: string;
}
export const globalValidationConfig: ValidationConfig = {};

function getObjectValidatable(instance: any) {
      return globalValidationConfig[instance.constructor.name].find(cl => cl.__classRef === instance.__proto__)?.validatableProps;
}

function getClassValidatable(target: any): ValidatablePropsConfig {
      let validatableObj = {} as ValidatablePropsConfig;
      if (!globalValidationConfig[target.constructor.name]) {
            globalValidationConfig[target.constructor.name] = [{
                  __classRef: target,
                  validatableProps: validatableObj
            }];
      } else {
            const result = globalValidationConfig[target.constructor.name].find(cl => cl.__classRef === target);
            if (result) {
                  validatableObj = result.validatableProps;
            } else {
                  globalValidationConfig[target.constructor.name].push({
                        __classRef: target,
                        validatableProps: validatableObj
                  })
            }
      }
      return validatableObj;

}

export function Validator(validatable: Validatable) {
      return function (target: any, propertyName: string) {
            const validatableObj = getClassValidatable(target);
            validatableObj[propertyName] = validatable;
      }
}

export function validate(obj: any, getValue?: (value: HTMLInputElement) => string, getLabel?: LabelPropMapping): ValidationResult {
      let isValid = true;
      let errors: string[] = [];
      let firstLevel = true;
      let loopingObj = obj;
      while (loopingObj.__proto__ !== Object.prototype) {
            const objConfig = getObjectValidatable(loopingObj);
            if (!objConfig) {
                  return {
                        isValid,
                        errors
                  }
            }
            for (const property in objConfig) {
                  const validators: Validatable | null = objConfig[property];
                  if (validators !== null) {
                        const propValue = getValue && typeof getValue === 'function' && firstLevel ? getValue(obj[property]).trim() : obj[property].toString().trim();
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
                              isValid = isValid && propValue.trim() !== "" && !isNaN(Number(propValue));
                              if (propValue.trim() === "" || isNaN(Number(propValue))) {
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
            firstLevel = false;
            loopingObj = loopingObj.__proto__;
      }
      return {
            isValid,
            errors
      }
}