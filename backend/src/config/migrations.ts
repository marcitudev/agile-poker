import * as fs from 'fs';
import * as path from 'path';
import pool from './db';

const rootPath = __dirname;
const migrationsPath = `${rootPath}\\migrations`;

export function runMigrations(): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
        try {
            await createMigrationsSchemaHistoryTable();

            const files = fs.readdirSync(migrationsPath);
    
            for (const [index, file] of files.entries()) {
                const isCorrect = await verifyFile(file);
                if(!isCorrect) {
                    reject(`Migration ${file} does not follow the established pattern for the file name`);
                }

                const filePath = path.join(migrationsPath, file);
    
                const stat = fs.statSync(filePath);
    
                if (stat.isFile()) {
                    const alreadyMigrated = `SELECT COUNT(*) FROM migrations_schema_history WHERE name = '${file}'`;
    
                    try {
                        const response = await pool.query(alreadyMigrated);
                        const count = Number.parseInt(response.rows[0].count);
                        if (count === 0) {
                            await apply(file, filePath);
                        }
                    } catch (err) {
                        console.error(`Migration ${index}: ${file} error`);
                    }
                }
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function verifyFile(file: string){
    const pattern: RegExp = /^V\d{3}__.{2,}\.sql$/;
    const match: RegExpMatchArray | null = file.match(pattern);

    return match;
}

async function createMigrationsSchemaHistoryTable(): Promise<void>{
    return new Promise<void>((resolve) => {
        const query = 'CREATE TABLE IF NOT EXISTS migrations_schema_history(id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, version INT NOT NULL)'
        pool.query(query, (err, response) => {
            if(err) throw new Error('migration_schema_history not created');
            if(response) resolve();
        });
    });
}

async function apply(file: string, filePath: string): Promise<void>{
    return new Promise<void>((resolve, reject) => {
        const sqlScript = fs.readFileSync(filePath, 'utf8');
        pool.query(sqlScript, async (err, response) => {
            if(err) {
                console.error(`Migration ${file}: ${err}`);
                reject();
            }
            if(response) {
                await registerMigration(file);
                console.log(`Migration ${file} applied`);
                resolve();
            }
        });

    });
}

async function registerMigration(file: string){
    const version = file.split('__')[0].replace('V', '');
    const query = `INSERT INTO migrations_schema_history(name, version) VALUES('${file}', ${version});`;
    pool.query(query, (err) => {
        if(err) console.error(`${file} not registered in migrations_schema_history`);
    });
}

