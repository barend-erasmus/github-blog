// Imports
import express = require("express");
import * as passport from 'passport';
import * as session from 'express-session';
import * as cookieSession from 'cookie-session';
import * as LinkedInStrategy from 'passport-linkedin';
import path = require('path');

// Imports middleware
import expressWinston = require('express-winston');
import exphbs = require('express-handlebars');
import robots = require('express-robots');

// Imports routes
import mainRoute = require('./routes/main');

// Imports logger
import { logger } from './logger';

// Import configurations
let config = require('./config').config;

const argv = require('yargs').argv;

if (argv.prod) {
    config = require('./config.prod').config;
}

export class WebApi {

    constructor(private app: express.Express, private port: number) {
        this.configureMiddleware(app);
        this.configureRoutes(app);
        this.configureErrorHandling(app);
    }

    public getApp(): express.Application {
        return this.app;
    }

    public run() {
        this.app.listen(this.port);
    }

    private configureMiddleware(app: express.Express) {

        app.disable('x-powered-by');

        // Configure view engine
        app.engine('handlebars', exphbs({
            defaultLayout: 'main',
            layoutsDir: path.join(__dirname, 'views/layouts'),
        }));

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'handlebars');


        // Configure robots file
        app.use(robots({ UserAgent: '*', Disallow: '' }))

        // Configure express-winston
        app.use(expressWinston.logger({
            meta: true,
            msg: 'HTTP Request: {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
            winstonInstance: logger,
            dynamicMeta: (req: express.Request, res: express.Response) => {
                return {
                    user: req.user ? req.user : null
                }
            }
        }));

        // Configures session
        app.use(session({
            secret: 'keyboard cat',
            resave: true,
            saveUninitialized: true
        }));

        // Configure passport
        app.use(passport.initialize());

        passport.serializeUser((user: any, done: (err: Error, obj: any) => void) => {
            done(null, user.displayName);
        });

        passport.deserializeUser((id: Error, done: (err: Error, obj: any) => void) => {
            done(null, id);
        });

        app.use(passport.session());

        passport.use(new LinkedInStrategy({
            consumerKey: '861jdkiau0rqs5',
            consumerSecret: 'x7x0u5FK5Pz9V5nB',
            callbackURL: "https://developersworkspace.co.za/auth/linkedin/callback"
        }, (token: string, tokenSecret: string, profile: any, done: (err: Error, obj: any) => void) => {
            return done(null, profile);
        }));

        // Configure static content
        app.use('/static', express.static(path.join(__dirname, 'public')));
    }

    private configureRoutes(app: express.Express) {
        app.use("/", mainRoute);

        app.get('/auth/linkedin', passport.authenticate('linkedin', {
            session: true,
            successRedirect: '/',
            failureRedirect: '/'
        }));

        app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
            session: true,
            successRedirect: '/',
            failureRedirect: '/'
        }), (req: express.Request, res: express.Response) => {
            res.redirect('/');
        });
    }

    private configureErrorHandling(app: express.Express) {
        app.use((err: Error, req: express.Request, res: express.Response, next: () => void) => {
            logger.error(err.message);

            res.status(500).send(err.message);
        });
    }
}

const port = 3000;
const api = new WebApi(express(), port);
api.run();
logger.info(`listening on ${port}`);
