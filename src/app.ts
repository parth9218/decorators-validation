function AutoBind(_: any, _2: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor {
      const originalMethod = propertyDescriptor.value;
      return {
            configurable: true,
            enumerable: false,
            get() {
                  return originalMethod.bind(this);
            }
      }
}

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

interface ValidationResult {
      isValid: boolean;
      errors: string[];
}

interface LabelPropMapping {
      [prop: string]: string;
}
const globalValidationConfig: ValidationConfig = {};

function Validator(validatable: Validatable) {
      return function (target: any, propertyName: string) {
            globalValidationConfig[target.constructor.name] = {
                  ...globalValidationConfig[target.constructor.name],
                  [propertyName]: validatable
            };
      }
}

function validate(obj: any, getValue?: (value: HTMLInputElement) => string, getLabel?: LabelPropMapping): ValidationResult {
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

enum ProjectStatus { ACTIVE, FINISHED }
const ProjectStatusMapping = {
      [ProjectStatus.ACTIVE]: 'active',
      [ProjectStatus.FINISHED]: 'finished'
}

interface Project {
      id: string;
      title: string;
      description: string;
      people: number;
      status: ProjectStatus;
}

interface Draggable {
      dragStartHandler(event: DragEvent): void;
      dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
      dragOverHandler(event: DragEvent): void;
      dropHandler(event: DragEvent): void;
      dragLeaveHandler(event: DragEvent): void;
}

class State<T extends number | string | symbol> {
      protected listeners: {
            [key in T]: Function[]
      } = {} as {
            [key in T]: Function[]
      };

      public addListener(type: T, listener: Function) {
            if (!this.listeners[type]) {
                  this.listeners[type] = [listener];
            } else {
                  this.listeners[type].push(listener);
            }
      }
}

class ProjectState extends State<ProjectStatus> {
      private static projectState = new ProjectState();
      private projects: Project[] = [];
      private constructor() {
            super();
      }
      public static getInstance() {
            return this.projectState;
      }

      public addProject(project: Project) {
            this.projects.push(project);
      }

      public moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find((p) => p.id === projectId);
            if (project && project.status !== newStatus) {
                  project.status = newStatus;
                  this.updateListeners();
            }
      }

      private updateListeners() {
            for (const key in this.listeners) {
                  for (const listener of this.listeners[Number(key) as keyof typeof this.listeners]) {
                        listener(this.projects.filter(project => project.status === (Number(key) as ProjectStatus)));
                  }
            }
      }

      public dispatchEvent(project: Project) {
            this.addProject(project);
            for (const listener of this.listeners[project.status]) {
                  listener(this.projects.filter(type => type.status === project.status));
            }
      }
}


const projectState = ProjectState.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
      templateElement: HTMLTemplateElement;
      hostElement: T;
      element: U;

      constructor(templateElementId: string, hostElementId: string, newElementId?: string, attachWhere?: InsertPosition) {
            this.templateElement = document.getElementById(templateElementId)! as HTMLTemplateElement;
            this.hostElement = document.getElementById(hostElementId)! as T;

            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild as U;
            if (newElementId) {
                  this.element.id = newElementId;
            }
            this.attach(attachWhere);
      }

      private attach(attachWhere?: InsertPosition) {
            this.hostElement.insertAdjacentElement(attachWhere ? attachWhere : 'beforeend', this.element);
      }

      abstract configure(): void;
      abstract renderContent(): void;
}


class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
      private project: Project;

      get persons() {
            return `${this.project.people} ${this.project.people === 1 ? 'person' : 'persons'} assigned.`;
      }

      constructor(project: Project, hostId: string) {
            super('single-project', hostId, undefined, 'beforeend');
            this.project = project;
            this.configure();
            this.renderContent();
      }

      @AutoBind
      dragStartHandler(event: DragEvent): void {
            event.dataTransfer!.setData('text/plain', this.project.id);
            event.dataTransfer!.effectAllowed = 'move';
      }

      @AutoBind
      dragEndHandler(event: DragEvent): void {
      }

      configure(): void {
            this.element.id = `${this.hostElement.id}-project-${this.project.id}`;
            this.element.draggable = true;
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
      }
      renderContent(): void {
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent = this.persons;
            this.element.querySelector('p')!.textContent = this.project.description;
      }
}


class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
      projectList: Project[] = [];
      projectType: ProjectStatus;

      constructor(type: ProjectStatus) {
            super('project-list', 'app', `${ProjectStatusMapping[type]}-projects`, 'beforeend');
            this.projectType = type;
            this.configure();
            this.renderContent();
      }

      @AutoBind
      dragOverHandler(event: DragEvent): void {
            event.stopPropagation();
            event.preventDefault();
            if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
                  const listEl = this.element.querySelector('ul')!;
                  if (!listEl.classList.contains("droppable"))
                        listEl.classList.add('droppable');
            }
      }
      @AutoBind
      dropHandler(event: DragEvent): void {
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');
            if (event.type === "drop" && event.dataTransfer!.types[0] === 'text/plain') {
                  projectState.moveProject(event.dataTransfer!.getData('text/plain'), this.projectType);
            }
      }
      @AutoBind
      dragLeaveHandler(event: DragEvent): void {
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');
      }

      configure(): void {
            projectState.addListener(this.projectType, (projects: Project[]) => {
                  this.projectList = projects;
                  this.renderProjects();
            });
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('drop', this.dropHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
      }

      private renderProjects() {
            const listEl = document.getElementById(`${ProjectStatusMapping[this.projectType]!}-project-list`) as HTMLUListElement;
            listEl.innerHTML = '';
            for (const project of this.projectList) {
                  new ProjectItem(project, listEl!.id);
            }
      }

      renderContent() {
            const listId = `${ProjectStatusMapping[this.projectType]}-project-list`;
            this.element.querySelector('ul')!.id = listId;
            this.element.querySelector('h2')!.textContent = ProjectStatusMapping[this.projectType].toUpperCase() + ' PROJECTS';
      }
}

new ProjectInput();
new ProjectList(ProjectStatus.ACTIVE);
new ProjectList(ProjectStatus.FINISHED);