import { QueryResult, QueryResultRow } from "pg";
import { SprintDTO } from "../models/dtos/SprintDTO";
import pool from "../config/db";
import { TaskService } from "./TaskService";

export class SprintService{

    taskService = new TaskService();

    public async getById(id: number): Promise<SprintDTO | void>{
        return this.getOne(`SELECT * FROM sprints WHERE id = ${id}`);
    }

    public async getByRoomId(roomId: number): Promise<Array<SprintDTO>>{
        return this.get(`SELECT * FROM sprints WHERE room_id = ${roomId}`);
    }

    public async conclude(id: number): Promise<SprintDTO>{
        return new Promise<SprintDTO>((resolve, reject) => {
            const query = `UPDATE sprints SET conclusion_date = NOW() WHERE id = ${id} RETURNING *`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) resolve(this.buildSprint(response.rows[0]));
            });
        });
    }

    public async changeName(id: number, name: string): Promise<SprintDTO>{
        return new Promise<SprintDTO>((resolve, reject) => {
            const query = `UPDATE sprints SET name = '${name}' WHERE id = ${id} RETURNING *`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) resolve(this.buildSprint(response.rows[0]));
            });
        });
    }

    public async delete(id: number): Promise<void>{
        return new Promise<void>((resolve, reject) => {
            const query = `DELETE FROM sprints WHERE id = ${id}`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) resolve();
            });
        });
    }

    public async create(name: string, roomId: number): Promise<SprintDTO>{
        return new Promise<SprintDTO>((resolve, reject) => {
            pool.query(`INSERT INTO sprints(name, room_id) VALUES('${name}', ${roomId}) RETURNING *`, (error, response) => {
                if(error) reject();
                if(response) resolve(this.buildSprint(response.rows[0]));
            });
        });
    }

    private async getOne(query: string): Promise<SprintDTO | void>{
        return new Promise<SprintDTO | void>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject(); 
                else if(response.rows.length > 0) resolve(this.buildSprint(response.rows[0]));
                resolve();
            });
        });
    }

    private async get(query: string): Promise<Array<SprintDTO>>{
        return new Promise<Array<SprintDTO>>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildSprints(response));
            });
        });
    }

    private async buildSprints(result: QueryResult<QueryResultRow>): Promise<Array<SprintDTO>>{
        return Promise.all(result.rows.map(async row => {
            return await this.buildSprint(row);
        }));
    }

    private async buildSprint(sprint: QueryResultRow): Promise<SprintDTO>{
        const tasks = await this.taskService.getBySprintId(sprint?.id);
        return new SprintDTO(
            sprint?.id,
            sprint?.name,
            sprint?.created_at,
            sprint?.conclusion_date,
            tasks);
    }
}