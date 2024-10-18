export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
