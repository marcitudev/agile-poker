import { TaskStatus } from "../models/enums/TaskStatus";

export class TaskStatusHelper{

    static getOrdinal(index: number | string): number{
        if(typeof(index) === 'string'){
            return TaskStatus[index as keyof typeof TaskStatus];
        }

        return this.getEnumByNumberIndex(index);
    }
    
    static getEnumByNumberIndex(index: number): TaskStatus{
        const enumArray = [
            TaskStatus.NOT_STARTED,
            TaskStatus.WAITING,
            TaskStatus.IN_PROGRESS,
            TaskStatus.SHOWING_RESULT,
            TaskStatus.DONE
        ];
    
        return index in enumArray ? enumArray[index] : TaskStatus.NOT_STARTED;
    }
}