import {db} from './database.js';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import express, {Express, Request} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import multer from 'multer';
import fs from 'fs/promises';
import md5 from 'md5';

// file pathing setup
const __filename: string = fileURLToPath(import.meta.url);
export const __dirname: string = path.dirname(__filename);

// .env setup
dotenv.config({path: path.join(__dirname, '../.env')});

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
app.use(bodyParser.raw({type: 'application/octet-stream', limit: '5gb'}));

app.use(session({
    secret: "testing",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}))

const storage: multer.StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'storage'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload: multer.Multer = multer({storage: storage})

function validateToken(req: any, res: any, next: any) {
    const authHeader: string = req.headers["authorization"];
    const token: string = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET || 'jwtSecret', (err: any, decoded: any) => {
        if (err) {
            console.log('error: ', err);
            return res.sendStatus(403);
        }
        req.tokenData = decoded;
        next();
    });
}


function generateAccessToken(userId: string) {
    return jwt.sign({userId}, process.env.JWT_SECRET || 'jwtSecret', {
        expiresIn: 60 * 60 * 24 * 7 // 1 week
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

app.post('/api/files/upload', async (req, res) => {
    const {name, size, currentChunkIndex, totalChunks} = req.query;
    // @ts-ignore
    const firstChunk = parseInt(currentChunkIndex) === 0;
    // @ts-ignore
    const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
    // @ts-ignore
    const ext = name!.split('.').pop();
    const data = req.body.toString().split(',')[1];
    const buffer = new Buffer(data);
    const tmpFileName = 'tmp_' + md5(name + req.ip) + '.' + ext;

    if (firstChunk) {
        await fs.unlink(path.join(__dirname, '..', 'storage', tmpFileName));
    }

    await fs.appendFile(path.join(__dirname, '..', 'storage', `${tmpFileName}`), buffer);

    if (lastChunk) {
        const finalFileName = md5(Date.now()).substring(0, 6) + '.' + ext;
        await fs.rename(path.join(__dirname, '..', 'storage', tmpFileName), path.join(__dirname, '..', 'storage', finalFileName));
        res.json({
            finalFileName
        })
    } else {
        res.json('ok');
    }
});


app.listen(process.env.PORT || 4000, () => {
    console.log(`Server listening on port ${process.env.PORT || 4000}`);
})