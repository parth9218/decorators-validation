import { ProjectInput } from "./components/ProjectInput.js";
import { ProjectList } from "./components/ProjectList.js";
import { ProjectStatus } from "./models/project-model.js";
import { ProjectInput as Something } from "./SomethingMore.js";
import { globalValidationConfig, validate } from "./decorators/validation.js";

new ProjectInput();
new ProjectList(ProjectStatus.ACTIVE);
new ProjectList(ProjectStatus.FINISHED);
const something = new Something("New Differenjfo");

console.log(globalValidationConfig);

console.log(validate(something));