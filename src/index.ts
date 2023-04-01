import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';

import { registerUser, logIn } from './controllers/UserController';
import { shortenUrl, getOriginalUrl } from './controllers/LinkController';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: COOKIE_SECRET as string,
    cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());

app.post('/api/users', registerUser); // Create an account
app.post('/api/login', logIn); // Log in to an account
app.post('/api/shortenUrl', shortenUrl); // Log in to an account
app.get('/shortenUrl', shortenUrl); // Log in to an account

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
