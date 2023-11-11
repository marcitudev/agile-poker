import { Pool } from "pg";

const pool = new Pool({
    user: 'username',
    host: 'host',
    database: 'database_name',
    password: 'password',
    port: 5432
});

export default pool;