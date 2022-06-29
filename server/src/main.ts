import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import express, {Express} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from "cookie-parser";
import session from "express-session";
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import fs from 'fs/promises';
import multer from 'multer';

// file pathing setup
const __filename: string = fileURLToPath(import.meta.url);
export const __dirname: string = path.dirname(__filename);

// .env setup
dotenv.config({path: path.join(__dirname, '../.env')});


// database setup
const db: Database.Database = new Database(path.join(__dirname, '..', 'tracker.db'), {
    fileMustExist: false,
    readonly: false,
});

// create table if it doesn't exist
db.prepare(`CREATE TABLE IF NOT EXISTS users
            (
                userId    INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT,
                lastName  TEXT,
                email     TEXT,
                password  TEXT
            )`).run();


// express setup
const app: Express = express();

app.use(cors({
    origin: 'http://localhost:3800',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.use(session({
    secret: "testing",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })

function validateToken(req: any, res: any, next: any) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET || 'jwtSecret', (err: any, decoded: any) => {
        if (err) return res.sendStatus(403);
        req.tokenData = decoded;
        next();
    });
}


function generateAccessToken(userId: string) {
    return jwt.sign({userId}, process.env.JWT_SECRET || 'jwtSecret', {
        expiresIn: '1h'
    });
}

app.get('/authenticated', validateToken, (req: any, res: any) => {
    res.sendStatus(200);
});

app.post('/api/users/login', async (req, res) => {
    console.log(req.body);
    const {email, password} = req.body;

    // get user from database
    const user = db.prepare(`SELECT *
                             FROM users
                             WHERE email = ?`).get(email);

    // check if user exists
    if (!user) {
        return res.sendStatus(401);
    }

    // check if password is correct
    if (!bcrypt.compareSync(password, user.password)) {
        return res.sendStatus(401);
    }

    // send access token
    res.status(200).json({
        token: `Bearer ${generateAccessToken(user.email)}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    })
})

app.post('/api/users/register', (req, res) => {
    console.log(req.body);
    const {firstName, lastName, email, password} = req.body;

    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // if email already exists, return false
    if (db.prepare(`SELECT *
                    FROM users
                    WHERE email = ?`).get(email)) {
        return res.sendStatus(409);
    }

    // insert user into database
    db.prepare(`INSERT INTO users (firstName, lastName, email, password)
                VALUES (?, ?, ?, ?)`).run(firstName, lastName, email, hashedPassword);

    // send access token
    res.status(200).json({
        token: `Bearer ${generateAccessToken(email)}`
    })
})

app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    const {file} = req;
    console.log(file?.filename);

    res.sendStatus(200);
});

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server listening on port ${process.env.PORT || 4000}`);
})