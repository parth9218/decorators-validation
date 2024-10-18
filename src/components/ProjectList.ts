/// <reference path="BaseComponent.ts"/>
/// <reference path="../models/project-model.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project-state.ts" />

namespace App {

      export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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
}