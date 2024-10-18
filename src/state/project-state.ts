namespace App {
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


      export const projectState = ProjectState.getInstance();
}