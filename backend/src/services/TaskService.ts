import { TaskDTO } from "../models/dtos/TaskDTO";
import pool from "../config/db";
import { QueryResult, QueryResultRow } from "pg";
import { TaskStatus } from "../models/enums/TaskStatus";

export class TaskService{

    public async getById(id: number): Promise<TaskDTO | undefined>{
        return this.getOne(`SELECT * FROM tasks WHERE id = ${id}`);
    }

    public async getBySprintId(sprintId: number): Promise<Array<TaskDTO>>{
        return this.get(`SELECT * FROM tasks WHERE sprint_id = ${sprintId}`);
    }

    public async create(sprintId: number, name: string): Promise<TaskDTO>{
        return new Promise<TaskDTO>((resolve, reject) => {
            const query = `INSERT INTO tasks(name, sprint_id) VALUES('${name}', ${sprintId}) RETURNING *`;
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildTask(response.rows[0]));
            });
        });
    }

    public async delete(id: number): Promise<undefined>{
        return new Promise<undefined>((resolve, reject) => {
            const query = `DELETE FROM tasks WHERE id = ${id}`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) resolve(undefined);
            });
        });
    }

    public async changeName(id: number, name: string): Promise<TaskDTO>{
        return new Promise<TaskDTO>((resolve, reject) => {
            const query = `UPDATE tasks SET name = '${name}' WHERE id = ${id} RETURNING *`;
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildTask(response.rows[0]));
            });
        });
    }

    public async canChangeStatus(id: number, roomId: number): Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            const query = `SELECT * FROM tasks t INNER JOIN sprints s ON s.id = t.sprint_id INNER JOIN rooms r ON r.id = s.room_id WHERE r.id = ${roomId} AND t.id <> ${id} AND t.status NOT IN(0,4)`;
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(response.rows.length > 0 ? false : true);
            });
        });
    }

    public async changeStatus(id: number, status: TaskStatus): Promise<TaskDTO>{
        return new Promise<TaskDTO>((resolve, reject) => {
            let query = `UPDATE tasks SET status = ${status} `;
            if(status == TaskStatus['DONE']) query += `, punctuation = (SELECT ROUND(AVG(punctuation)::numeric, 2) FROM user_votes WHERE task_id = ${id}) `;
            query += `WHERE id = ${id} RETURNING *`;
            
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildTask(response.rows[0]));
            });
        });
    }

    private async getOne(query: string): Promise<TaskDTO | undefined>{
        return new Promise<TaskDTO | undefined>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject(); 
                else if(response.rows.length > 0) resolve(this.buildTask(response.rows[0]));
                resolve(undefined);
            });
        });
    }

    private async get(query: string): Promise<Array<TaskDTO>>{
        return new Promise<Array<TaskDTO>>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildTasks(response));
            });
        });
    }

    private buildTasks(result: QueryResult<QueryResultRow>): Array<TaskDTO>{
        const tasks: Array<TaskDTO> = result.rows.map(row => {
            return this.buildTask(row);
        });

        return tasks;
    }

    private buildTask(task: QueryResultRow): TaskDTO{
        return new TaskDTO(
            task?.id,
            task?.name,
            task?.created_at,
            TaskStatus[task?.status as keyof typeof TaskStatus],
            task?.punctuation);
    }
}