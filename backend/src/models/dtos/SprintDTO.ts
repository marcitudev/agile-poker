import { TaskDTO } from "./TaskDTO";

export class SprintDTO{
    id: number;
    name: string;
    createdAt: Date;
    conclusionDate: Date | undefined;
    tasks: Array<TaskDTO>;

    constructor(id: number, name: string, createdAt: Date, conclusionDate: Date, tasks?: Array<TaskDTO>){
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.conclusionDate = conclusionDate;
        this.tasks = tasks ? tasks : new Array<TaskDTO>();
    }
}