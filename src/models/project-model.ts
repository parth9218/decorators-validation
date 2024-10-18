
export enum ProjectStatus { ACTIVE, FINISHED }

export interface Project {
      id: string;
      title: string;
      description: string;
      people: number;
      status: ProjectStatus;
}