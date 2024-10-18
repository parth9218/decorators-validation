/// <reference path="models/project-model.ts" />
/// <reference path="components/ProjectInput.ts" />
/// <reference path="components/ProjectItem.ts" />
/// <reference path="components/ProjectList.ts" />

namespace App {
      new ProjectInput();
      new ProjectList(ProjectStatus.ACTIVE);
      new ProjectList(ProjectStatus.FINISHED);
}
