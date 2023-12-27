import { Task } from "./Task";
import { User } from "./User";

export class Vote{
    id: number;
    user: User;
    task: Task;
    punctuation: number;

    constructor(id: number, user: User, task: Task, punctuation: number){
        this.id = id;
        this.user = user;
        this.task = task;
        this.punctuation = punctuation;
    }
}