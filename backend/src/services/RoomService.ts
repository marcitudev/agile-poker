import { QueryResult, QueryResultRow } from "pg";
import pool from "../config/db";
import { RoomDTO } from "../models/dtos/RoomDTO";

export class RoomService{

    public getAllRooms(): Promise<Array<RoomDTO>>{
        return this.get('SELECT * FROM rooms');
    }

    private async get(query: string): Promise<Array<RoomDTO>>{
        return new Promise<Array<RoomDTO>>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildRooms(response));
            });
        });
    }

    private buildRooms(result: QueryResult<QueryResultRow>): Array<RoomDTO>{
        const users: Array<RoomDTO> = result.rows.map(row => {
            return this.buildRoom(row);
        });

        return users;
    }

    private buildRoom(room: QueryResultRow): RoomDTO{
        return new RoomDTO(
            room?.id,
            room?.name,
            room?.code,
            room?.host_votes,
            room?.card_value_type,
            room?.created_at);
    }
}