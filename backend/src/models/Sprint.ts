import { Task } from "./Task";

export class Sprint{
    id: number;
    name: string;
    createdAt: Date;
    conclusionDate: Date | undefined;
    tasks: Array<Task>;

    constructor(id: number, name: string, createdAt: Date, conclusionDate: Date, tasks?: Array<Task>){
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.conclusionDate = conclusionDate;
        this.tasks = tasks ? tasks : new Array<Task>();
    }
}