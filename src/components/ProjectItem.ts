/// <reference path="BaseComponent.ts"/>
/// <reference path="../decorators/autobind.ts" />

namespace App {
      export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
}