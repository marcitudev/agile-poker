import { TaskStatus } from "./enums/TaskStatus";

export class Task{
    id: number;
    name: string;
    createdAt: Date;
    status: TaskStatus;
    punctuation: number | undefined;

    constructor(id: number, name: string, createdAt: Date, status: TaskStatus, punctuation: number){
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.status = status;
        this.punctuation = punctuation;
    }
}