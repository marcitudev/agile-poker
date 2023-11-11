import pool from '../config/db';
import { User } from '../models/User';

export class UserService{
    
    public async getAllUsers(): Promise<Array<User>>{
        const client = await pool.connect();

        return new Promise<Array<User>>((resolve, reject) => {
            client.query('SELECT * FROM users', (error, response) => {
                if(error) {
                    reject(new Array<User>());
                } else {
                    const users: Array<User> = response.rows.map(row => {
                        return new User(
                            row?.id,
                            row?.username,
                            row?.first_name,
                            row?.last_name,
                            row?.password)
                    });
        
                    resolve(users);
                }
            });
        });
    }
}