import { QueryResult, QueryResultRow } from "pg";
import pool from "../config/db";
import { RoomDTO } from "../models/dtos/RoomDTO";
import { UserService } from "./UserService";
import { Room } from "../models/Room";
import { SprintService } from "./SprintService";
import { CardValueTypeHelper } from "../helpers/CardValueTypeHelper";
import { CardValueType } from "../models/enums/CardValueType";

export class RoomService{

    userService = new UserService();
    sprintService = new SprintService();

    public async getAllRooms(): Promise<Array<RoomDTO>>{
        return this.get('SELECT * FROM rooms');
    }

    public async getByCode(code: string): Promise<RoomDTO | void>{
        return this.getOne(`SELECT * FROM rooms WHERE UPPER(RTRIM(LTRIM(code))) = UPPER(RTRIM(LTRIM('${code}')))`);
    }

    public async getById(id: number): Promise<RoomDTO | void>{
        return this.getOne(`SELECT * FROM rooms WHERE id = ${id}`);
    }

    public async getByUserId(userId: number): Promise<Array<RoomDTO>> {
        return this.get(`SELECT DISTINCT(r.*) FROM rooms r LEFT JOIN users_rooms ur ON ur.room_id = r.id WHERE r.user_id = ${userId} OR ur.user_id = ${userId}`);
    }

    public async getByNameAndUserId(name: string, userId: number): Promise<RoomDTO | void> {
        return this.getOne(`SELECT * FROM rooms WHERE LOWER(RTRIM(LTRIM(name))) = LOWER(RTRIM(LTRIM('${name}'))) AND user_id = ${userId}`);
    }

    public async getByIdAndPassword(roomId: number, password?: string): Promise<RoomDTO | void>{
        return this.getOne(`SELECT * FROM rooms WHERE id = ${roomId} AND (pgp_sym_decrypt(password, '${process.env.CRIPTO_PASSWORD}') = ${password ? "'" + password + "'" : 'NULL'} OR password IS NULL)`);
    }

    public async getBySprintId(sprintId: number): Promise<RoomDTO | void>{
        return this.getOne(`SELECT * FROM rooms r WHERE r.id = (SELECT room_id FROM sprints s WHERE s.id = ${sprintId})`);
    }

    public async getByTaskId(taskId: number): Promise<RoomDTO | void>{
        return this.getOne(`SELECT r.* FROM rooms r JOIN sprints s ON s.room_id = r.id JOIN tasks t ON t.sprint_id = s.id WHERE t.id = ${taskId}`);
    }

    public async create(userId: number, room: Room): Promise<RoomDTO>{
        room.code = this.generateRoomCode();
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<RoomDTO>(async (resolve, reject) => {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                
                const roomQuery = `INSERT INTO rooms(name, code, host_votes, card_value_type, user_id, password) VALUES(RTRIM(LTRIM('${room.name}')), '${this.generateRoomCode()}', ${room.hostVotes}, ${CardValueTypeHelper.getOrdinal(room.cardValueType)}, ${userId}, ${room.password ? "pgp_sym_encrypt('" + room.password + "','" + process.env.CRIPTO_PASSWORD + "')" : null}) RETURNING *`;
                const roomPersist = await client.query(roomQuery);
                const roomPersisted = await this.buildRoom(roomPersist.rows[0]);

                if(CardValueTypeHelper.getOrdinal(room.cardValueType) === CardValueType['CUSTOM']){
                    const cardValuesQuery = `INSERT INTO custom_card_values(values, room_id) VALUES(ARRAY[${room.cardValues}], ${(roomPersisted).id}) RETURNING values`;
                    const cardValuesPersist = await client.query(cardValuesQuery);

                    if(roomPersist.rows[0] && cardValuesPersist.rows[0]){
                        await client.query('COMMIT');
                        roomPersisted.cardValues = cardValuesPersist.rows[0].values;
                        resolve(roomPersisted);
                    } 
                    else {
                        await client.query('ROLLBACK');
                        reject();
                    }
                }

                resolve(roomPersisted);
            } catch(e){
                await client.query('ROLLBACK');
                reject();
            } finally {
                client.release();
            }
        });
    }

    public async userCanEnterTheRoom(userId: number, roomId: number): Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            const query = `SELECT COUNT(*) FROM rooms r LEFT JOIN users_rooms ur ON ur.room_id = r.id WHERE r.id = ${roomId} AND (r.user_id = ${userId} OR ur.user_id = ${userId})`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) {
                    const count = Number.parseInt(response.rows[0].count);
                    resolve(count == 0 ? true : false);
                }
            });
        });
    }

    public async enterTheRoom(userId: number, roomId: number): Promise<void>{
        return new Promise<void>((resolve, reject) => {
            const query = `INSERT INTO users_rooms(user_id, room_id) VALUES(${userId}, ${roomId})`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) resolve();
            });
        });
    }

    public async delete(roomId: number, password?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const query = `DELETE FROM rooms WHERE id = ${roomId} AND (pgp_sym_decrypt(password, '${process.env.CRIPTO_PASSWORD}') = ${password ? "'" + password + "'" : 'NULL'} OR password IS NULL)`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) resolve();
            });
        });
    }

    private async getOne(query: string, withSprints = true): Promise<RoomDTO | void>{
        return new Promise<RoomDTO | void>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject(); 
                else if(response.rows.length > 0) resolve(this.buildRoom(response.rows[0], withSprints));
                resolve();
            });
        });
    }

    private async get(query: string, withSprints = true): Promise<Array<RoomDTO>>{
        return new Promise<Array<RoomDTO>>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildRooms(response, withSprints));
            });
        });
    }

    private async buildRooms(result: QueryResult<QueryResultRow>, withSprints = true): Promise<Array<RoomDTO>>{
        return Promise.all(result.rows.map(async row => {
            return await this.buildRoom(row, withSprints);
        }));
    }

    private async buildRoom(room: QueryResultRow, withSprints = true): Promise<RoomDTO>{
        const user = await this.userService.getById(room?.user_id);
        let sprints;
        if(withSprints) sprints = await this.sprintService.getByRoomId(room?.id);
        let cardValues;
        if(room?.card_value_type === CardValueType['CUSTOM']) cardValues = await this.getCustomCardValuesByRoomId(room?.id);
        
        return new RoomDTO(
            room?.id,
            room?.name,
            room?.code,
            room?.host_votes,
            CardValueType[room?.card_value_type as keyof typeof CardValueType],
            user ? user : undefined,
            room?.created_at,
            sprints,
            cardValues
         );
    }
    
    private async getCustomCardValuesByRoomId(id: number): Promise<Array<number>>{
        return new Promise<Array<number>>((resolve, reject) => {
            const query = `SELECT values FROM custom_card_values WHERE room_id = ${id}`;
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(response.rows[0] ? response.rows[0].values : undefined);
            });
        });
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