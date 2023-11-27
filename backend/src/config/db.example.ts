import { Pool } from "pg";
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: process.env.DB_PASSWORD,
    port: 5432
});

export default pool;