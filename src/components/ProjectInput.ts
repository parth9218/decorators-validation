import { Component } from "./BaseComponent.js";
import { ProjectStatus } from '../models/project-model.js';
import { projectState } from "../state/project-state.js";
import { AutoBind } from "../decorators/autobind.js";
import { ValidationResult, Validator, validate } from "../decorators/validation.js";


export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
      @Validator({ required: true, minLength: 5, maxLength: 20 })
      titleInputElement: HTMLInputElement;
      @Validator({ required: true, minLength: 10, maxLength: 100 })
      descriptionInputElement: HTMLInputElement;
      @Validator({ required: true, isNumber: true, min: 1, max: 10 })
      peopleInputElement: HTMLInputElement;

      constructor() {
            super('project-input', 'app', 'user-input', 'afterbegin');
            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
            this.configure();
      }

      configure(): void {
            this.element.addEventListener('submit', this.submitHandler);
      }

      renderContent(): void {

      }

      private clearInputs() {
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
            this.peopleInputElement.value = '';
      }

      private gatherUserInput(): [string, string, number] | void {
            const validationResult: ValidationResult = validate(this, (input: HTMLInputElement) => input.value, {
                  titleInputElement: 'Title',
                  descriptionInputElement: 'Description',
                  peopleInputElement: 'People'
            });
            if (!validationResult.isValid) {
                  alert(validationResult.errors.join('\n'));
                  return;
            } else {
                  return [this.titleInputElement.value.trim(), this.descriptionInputElement.value.trim(), Number(this.peopleInputElement.value.trim())];
            }

      }

      @AutoBind
      private submitHandler(event: Event) {
            event.preventDefault();
            const result = this.gatherUserInput();
            if (Array.isArray(result)) {
                  const [title, desc, people] = result;
                  projectState.dispatchEvent({
                        id: Math.random().toString(),
                        title,
                        description: desc,
                        people,
                        status: ProjectStatus.ACTIVE
                  })
                  this.clearInputs();
            }
      }
}