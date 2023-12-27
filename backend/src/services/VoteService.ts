import { QueryResult, QueryResultRow } from "pg";
import pool from "../config/db";
import { RoomDTO } from "../models/dtos/RoomDTO";
import { VoteDTO } from "../models/dtos/VoteDTO";
import { CardValueType } from "../models/enums/CardValueType";
import { RoomService } from "./RoomService";
import { UserService } from "./UserService";
import { TaskService } from "./TaskService";
import { CardValueTypeHelper } from "../helpers/CardValueTypeHelper";

export class VoteService{
    roomService = new RoomService();
    userService = new UserService();
    taskService = new TaskService();

    public async vote(userId: number, taskId: number, punctuation: number): Promise<VoteDTO>{
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<VoteDTO>(async (resolve, reject) => {
            const userVote = await this.getByUserIdAndTaskId(userId, taskId);

            let query = `INSERT INTO user_votes(user_id, task_id, punctuation) VALUES(${userId}, ${taskId}, ${punctuation}) RETURNING *`;
            if(userVote) query = `UPDATE user_votes SET punctuation = ${punctuation} WHERE id = ${userVote.id} RETURNING *`;
            pool.query(query, (error, response) => {
                if(error) reject(error);
                if(response) resolve(this.buildVote(response.rows[0]));
            });
        });
    }

    public async getByUserIdAndTaskId(userId: number, taskId: number): Promise<VoteDTO | undefined>{
        return this.getOne(`SELECT * FROM user_votes WHERE user_id = ${userId} AND task_id = ${taskId}`, false, false);
    }

    public async canVote(roomId: number, participantId: number): Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            const query = `SELECT r.* FROM rooms r LEFT JOIN users_rooms ur ON ur.room_id = r.id WHERE (ur.user_id = ${participantId} OR (r.user_id = ${participantId} AND r.host_votes = true)) AND r.id = ${roomId}`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response && response.rows.length > 0) resolve(true);
                resolve(false)
            });
        });
    }

    public async isValidVote(room: RoomDTO, vote: number): Promise<boolean>{
        return new Promise<boolean>((resolve) => {
            const { cardValueType, cardValues } = room;
            const cardValueTypeOrdinal = CardValueTypeHelper.getOrdinal(cardValueType);
            if(vote === -1 || 
               cardValueTypeOrdinal === CardValueType['SEQUENTIAL'] && [1,2,3,4,5,6,7,8,9,10].includes(vote) || 
               cardValueTypeOrdinal === CardValueType['FIBONACCI'] && [1,2,3,5,8,13,21,34,55,89].includes(vote) ||
               cardValueTypeOrdinal === CardValueType['CUSTOM'] && cardValues && cardValues.includes(vote)) resolve(true);
            resolve(false);
        });
    }

    private async getOne(query: string, withUser = true, withTask = true): Promise<VoteDTO | undefined>{
        return new Promise<VoteDTO | undefined>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response && response.rows[0]) resolve(this.buildVote(response.rows[0], withUser, withTask));
                resolve(undefined);
            });
        });
    }

    private async buildVotes(result: QueryResult): Promise<Array<VoteDTO>>{
        return Promise.all(result.rows.map(async (row) => {
            return await this.buildVote(row);
        }));
    }

    private async buildVote(row: QueryResultRow, withUser = true, withTask = true): Promise<VoteDTO>{
        const user = withUser ? await this.userService.getById(row.user_id) : undefined;
        const task = withTask ? await this.taskService.getById(row.task_id) : undefined;
        return new Promise((resolve) => {
            resolve(new VoteDTO(
                row.id,
                user,
                task,
                row.punctuation
            ));
        });
    }
}