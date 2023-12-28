import { TaskDTO } from "./TaskDTO";
import { UserDTO } from "./UserDTO";

export class VoteDTO{
    id: number;
    user: UserDTO | undefined;
    task: TaskDTO | undefined;
    punctuation: number;

    constructor(id: number, user: UserDTO | undefined, task: TaskDTO | undefined, punctuation: number){
        this.id = id;
        this.user = user;
        this.task = task;
        this.punctuation = punctuation;
    }
}