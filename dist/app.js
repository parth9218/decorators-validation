"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function AutoBind(_, _2, propertyDescriptor) {
    const originalMethod = propertyDescriptor.value;
    return {
        configurable: true,
        enumerable: false,
        get() {
            return originalMethod.bind(this);
        }
    };
}
const globalValidationConfig = {};
function Validator(validatable) {
    return function (target, propertyName) {
        globalValidationConfig[target.constructor.name] = Object.assign(Object.assign({}, globalValidationConfig[target.constructor.name]), { [propertyName]: validatable });
    };
}
function validate(obj, getValue, getLabel) {
    const objConfig = globalValidationConfig[obj.constructor.name];
    let isValid = true;
    let errors = [];
    if (!objConfig) {
        return {
            isValid,
            errors
        };
    }
    for (const property in objConfig) {
        const validators = objConfig[property];
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
    };
}
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["ACTIVE"] = 0] = "ACTIVE";
    ProjectStatus[ProjectStatus["FINISHED"] = 1] = "FINISHED";
})(ProjectStatus || (ProjectStatus = {}));
const ProjectStatusMapping = {
    [ProjectStatus.ACTIVE]: 'active',
    [ProjectStatus.FINISHED]: 'finished'
};
class State {
    constructor() {
        this.listeners = {};
    }
    addListener(type, listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = [listener];
        }
        else {
            this.listeners[type].push(listener);
        }
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        return this.projectState;
    }
    addProject(project) {
        this.projects.push(project);
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find((p) => p.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const key in this.listeners) {
            for (const listener of this.listeners[Number(key)]) {
                listener(this.projects.filter(project => project.status === Number(key)));
            }
        }
    }
    dispatchEvent(project) {
        this.addProject(project);
        for (const listener of this.listeners[project.status]) {
            listener(this.projects.filter(type => type.status === project.status));
        }
    }
}
ProjectState.projectState = new ProjectState();
const projectState = ProjectState.getInstance();
class Component {
    constructor(templateElementId, hostElementId, newElementId, attachWhere) {
        this.templateElement = document.getElementById(templateElementId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(attachWhere);
    }
    attach(attachWhere) {
        this.hostElement.insertAdjacentElement(attachWhere ? attachWhere : 'beforeend', this.element);
    }
}
class ProjectInput extends Component {
    constructor() {
        super('project-input', 'app', 'user-input', 'afterbegin');
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    renderContent() {
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    gatherUserInput() {
        const validationResult = validate(this, (input) => input.value, {
            titleInputElement: 'Title',
            descriptionInputElement: 'Description',
            peopleInputElement: 'People'
        });
        if (!validationResult.isValid) {
            alert(validationResult.errors.join('\n'));
            return;
        }
        else {
            return [this.titleInputElement.value.trim(), this.descriptionInputElement.value.trim(), Number(this.peopleInputElement.value.trim())];
        }
    }
    submitHandler(event) {
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
            });
            this.clearInputs();
        }
    }
}
__decorate([
    Validator({ required: true, minLength: 5, maxLength: 20 })
], ProjectInput.prototype, "titleInputElement", void 0);
__decorate([
    Validator({ required: true, minLength: 10, maxLength: 100 })
], ProjectInput.prototype, "descriptionInputElement", void 0);
__decorate([
    Validator({ required: true, isNumber: true, min: 1, max: 10 })
], ProjectInput.prototype, "peopleInputElement", void 0);
__decorate([
    AutoBind
], ProjectInput.prototype, "submitHandler", null);
class ProjectItem extends Component {
    get persons() {
        return `${this.project.people} ${this.project.people === 1 ? 'person' : 'persons'} assigned.`;
    }
    constructor(project, hostId) {
        super('single-project', hostId, undefined, 'beforeend');
        this.project = project;
        this.configure();
        this.renderContent();
    }
    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(event) {
    }
    configure() {
        this.element.id = `${this.hostElement.id}-project-${this.project.id}`;
        this.element.draggable = true;
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = this.persons;
        this.element.querySelector('p').textContent = this.project.description;
    }
}
__decorate([
    AutoBind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    AutoBind
], ProjectItem.prototype, "dragEndHandler", null);
class ProjectList extends Component {
    constructor(type) {
        super('project-list', 'app', `${ProjectStatusMapping[type]}-projects`, 'beforeend');
        this.projectList = [];
        this.projectType = type;
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            const listEl = this.element.querySelector('ul');
            if (!listEl.classList.contains("droppable"))
                listEl.classList.add('droppable');
        }
    }
    dropHandler(event) {
        const listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
        if (event.type === "drop" && event.dataTransfer.types[0] === 'text/plain') {
            projectState.moveProject(event.dataTransfer.getData('text/plain'), this.projectType);
        }
    }
    dragLeaveHandler(event) {
        event.preventDefault();
        const listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    }
    configure() {
        projectState.addListener(this.projectType, (projects) => {
            this.projectList = projects;
            this.renderProjects();
        });
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
    }
    renderProjects() {
        const listEl = document.getElementById(`${ProjectStatusMapping[this.projectType]}-project-list`);
        listEl.innerHTML = '';
        for (const project of this.projectList) {
            new ProjectItem(project, listEl.id);
        }
    }
    renderContent() {
        const listId = `${ProjectStatusMapping[this.projectType]}-project-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = ProjectStatusMapping[this.projectType].toUpperCase() + ' PROJECTS';
    }
}
__decorate([
    AutoBind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    AutoBind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    AutoBind
], ProjectList.prototype, "dragLeaveHandler", null);
//# sourceMappingURL=app.js.map