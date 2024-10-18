namespace App {
      export enum ProjectStatus { ACTIVE, FINISHED }
      export const ProjectStatusMapping = {
            [ProjectStatus.ACTIVE]: 'active',
            [ProjectStatus.FINISHED]: 'finished'
      }

      export interface Project {
            id: string;
            title: string;
            description: string;
            people: number;
            status: ProjectStatus;
      }
}