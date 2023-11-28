import { QueryResult, QueryResultRow } from "pg";
import pool from "../config/db";
import { RoomDTO } from "../models/dtos/RoomDTO";
import { UserService } from "./UserService";
import { Room } from "../models/Room";

export class RoomService{

    userService = new UserService();

    public getAllRooms(): Promise<Array<RoomDTO>>{
        return this.get('SELECT * FROM rooms');
    }

    public getByCode(code: string): Promise<RoomDTO | void>{
        return this.getOne(`SELECT * FROM rooms WHERE UPPER(code) = UPPER('${code}')`);
    }

    public getByNameAndUserId(name: string, userId: number): Promise<RoomDTO | void> {
        return this.getOne(`SELECT * FROM rooms WHERE LOWER(RTRIM(LTRIM(name))) = LOWER(RTRIM(LTRIM('${name}'))) AND user_id = ${userId}`);
    }

    public create(userId: number, room: Room): Promise<RoomDTO>{
        room.code = this.generateRoomCode();
        return new Promise<RoomDTO>((resolve, reject) => {
            try {
                const query = `INSERT INTO rooms(name, code, host_votes, card_value_type, user_id, password) VALUES(RTRIM(LTRIM('${room.name}')), '${this.generateRoomCode()}', ${room.hostVotes}, ${room.cardValueType}, ${userId}, ${room.password ? "pgp_sym_encrypt('" + room.password + "','" + process.env.CRIPTO_PASSWORD + "')" : null}) RETURNING *`;
                pool.query(query, (error, response) => {
                    if(error) reject();
                    if(response) resolve(this.buildRoom(response.rows[0]));
                });
            } catch(e){
                reject();
            }
        });
    }

    private async getOne(query: string): Promise<RoomDTO | void>{
        return new Promise<RoomDTO | void>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject(); 
                else if(response.rows.length > 0) resolve(this.buildRoom(response.rows[0]));
                resolve();
            });
        });
    }

    private async get(query: string): Promise<Array<RoomDTO>>{
        return new Promise<Array<RoomDTO>>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildRooms(response));
            });
        });
    }

    private async buildRooms(result: QueryResult<QueryResultRow>): Promise<Array<RoomDTO>>{
        return Promise.all(result.rows.map(async row => {
            return await this.buildRoom(row);
        }));
    }

    private async buildRoom(room: QueryResultRow): Promise<RoomDTO>{
        const user = await this.userService.getById(room?.user_id);
        return new RoomDTO(
            room?.id,
            room?.name,
            room?.code,
            room?.host_votes,
            room?.card_value_type,
            user ? user : undefined,
            room?.created_at
         );
    }

    private generateRoomCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
      
        for (let i = 0; i < 6; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          code += characters.charAt(randomIndex);
        }

        let codeAlreadyExists = false;
        this.getByCode(code).then(room => codeAlreadyExists = room ? true : false);
        if(codeAlreadyExists) this.generateRoomCode();
      
        return code;
      }
}