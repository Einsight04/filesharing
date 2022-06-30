import {__dirname} from "./main";
import path from 'path';
import Database from 'better-sqlite3';

// database setup
export const db: Database.Database = new Database(path.join(__dirname, '..', 'tracker.db'), {
    fileMustExist: false, // if the file doesn't exist, it will be created
    readonly: false,      // if the file is readonly, it will be opened in read-write mode
});

// create table if it doesn't exist
db.prepare(`CREATE TABLE IF NOT EXISTS users
            (
                userId    INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT,
                lastName  TEXT,
                email     TEXT,
                password  TEXT,
                files     TEXT
            )`).run();
