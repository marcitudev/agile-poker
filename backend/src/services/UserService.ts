import { QueryResult, QueryResultRow } from 'pg';
import pool from '../config/db';
import { UserDTO } from '../models/dtos/UserDTO';
import { User } from '../models/User';

export class UserService{
    
    public async getAllUsers(): Promise<Array<UserDTO>>{
        return this.get('SELECT * FROM users');
    }

    public async getById(id: number): Promise<UserDTO | void>{
        return this.getOne(`SELECT * FROM users WHERE id = ${id}`);
    }

    public async getByIdAndPassword(id: number, password: string): Promise<UserDTO | void>{
        return this.getOne(`SELECT * FROM users WHERE id = ${id} AND pgp_sym_decrypt(password, '${process.env.CRIPTO_PASSWORD}') = '${password}'`);
    }

    public async getByUsername(username: string): Promise<UserDTO | void>{
        return this.getOne(`SELECT * FROM users WHERE LOWER(username) = LOWER('${username}')`);
    }

    public async getByUsernameAndPassword(username: string, password: string): Promise<UserDTO | void>{
        return this.getOne(`SELECT * FROM users WHERE LOWER(username) = LOWER('${username}') AND pgp_sym_decrypt(password, '${process.env.CRIPTO_PASSWORD}') = '${password}'`);
    }

    public async create(user: User): Promise<UserDTO>{
        return new Promise<UserDTO>((resolve, reject) => {
            pool.query(`INSERT INTO users(username, first_name, last_name, password) VALUES(LOWER('${user.username}'), '${user.firstName}', '${user.lastName}', pgp_sym_encrypt('${user.password}', '${process.env.CRIPTO_PASSWORD}')) RETURNING *`, (error, response) => {
                if(error) reject();
                if(response) resolve(this.buildUser(response.rows[0]));
            });
        });
    }

    public async update(id: number, user: UserDTO): Promise<UserDTO>{
        return new Promise<UserDTO>((resolve, reject) => {
            const updateFieldsAndValues: Array<string> = new Array<string>();
            Object.entries(user).forEach(([key, value]) => {
                if(key !== 'id' && value) updateFieldsAndValues.push(`${key} = '${value}'`)
            });
            if(updateFieldsAndValues.length == 0) reject();
            const query = `UPDATE users SET ${updateFieldsAndValues.join(', ')} WHERE id = ${id} RETURNING *`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) resolve(this.buildUser(response.rows[0]));
            });
        });
    }

    public async delete(id: number, password: string): Promise<void>{
        return new Promise<void>((resolve, reject) => {
            const query = `DELETE FROM users WHERE id = ${id} AND pgp_sym_decrypt(password, '${process.env.CRIPTO_PASSWORD}') = '${password}'`;
            pool.query(query, (error, response) => {
                if(error) reject();
                if(response) resolve();
            });
        });
    }

    private async getOne(query: string): Promise<UserDTO | void>{
        return new Promise<UserDTO | void>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject(); 
                else if(response.rows.length > 0) resolve(this.buildUser(response.rows[0]));
                resolve();
            });
        });
    }

    private async get(query: string): Promise<Array<UserDTO>>{
        return new Promise<Array<UserDTO>>((resolve, reject) => {
            pool.query(query, (error, response) => {
                if(error) reject();
                resolve(this.buildUsers(response));
            });
        });
    }

    private buildUsers(result: QueryResult<QueryResultRow>): Array<UserDTO>{
        const users: Array<UserDTO> = result.rows.map(row => {
            return this.buildUser(row);
        });

        return users;
    }

    private buildUser(user: QueryResultRow): UserDTO{
        return new UserDTO(
            user?.id,
            user?.username,
            user?.first_name,
            user?.last_name);
    }
}
