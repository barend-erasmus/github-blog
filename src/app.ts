// Imports
import express = require("express");
import * as cookieSession from 'cookie-session';
import * as passport from 'passport';
import * as GithubStrategy from 'passport-github';
import * as GoogleStrategy from 'passport-google-oauth20';
import * as LinkedInStrategy from 'passport-linkedin';
import * as co from 'co';
import * as cron from 'cron';
import * as yargs from 'yargs';

import * as fs from 'fs';
import * as path from 'path';
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));

// Imports repositories
import { PostRepository } from './repositories/sequelize/post';
import { VisitorRepository } from './repositories/sequelize/visitor';

// Imports services
import { PostService } from './services/post';
import { VisitorService } from './services/visitor';

// Imports middleware
import expressWinston = require('express-winston');
import exphbs = require('express-handlebars');
import robots = require('express-robots');

// Imports routes
import mainRoute = require('./routes/main');

// Imports logger
import { logger } from './logger';

const argv = yargs.argv;

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
        app.use(robots({ UserAgent: '*', Disallow: '' }));

        // Configure express-winston
        app.use(expressWinston.logger({
            dynamicMeta: (req: express.Request, res: express.Response) => {
                return {
                    user: req.user ? req.user : null,
                };
            },
            meta: true,
            msg: 'HTTP Request: {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
            winstonInstance: logger,
        }));

        // Configures session
        app.use(cookieSession({
            keys: ['J#Z!AL6ZbZ3kzPCJ'],
            maxAge: 604800000, // 7 Days
            name: 'session',
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
            callbackURL: argv.prod ? config.production.oauth2.linkedIn.callback : config.development.oauth2.linkedIn.callback,
            consumerKey: argv.prod ? config.production.oauth2.linkedIn.clientId : config.development.oauth2.linkedIn.clientId,
            consumerSecret: argv.prod ? config.production.oauth2.linkedIn.clientSecret : config.development.oauth2.linkedIn.clientSecret,
        }, (token: string, tokenSecret: string, profile: any, done: (err: Error, obj: any) => void) => {

            const self = this;
            co(function* () {
                yield self.geVistorService().login(profile.id, profile.displayName, 'LinkedIn');
            });

            return done(null, profile);
        }));

        passport.use(new GoogleStrategy({
            callbackURL: argv.prod ? config.production.oauth2.google.callback : config.development.oauth2.google.callback,
            clientID: argv.prod ? config.production.oauth2.google.clientId : config.development.oauth2.google.clientId,
            clientSecret: argv.prod ? config.production.oauth2.google.clientSecret : config.development.oauth2.google.clientSecret,
        }, (accessToken: string, refreshToken: string, profile: any, done: (err: Error, obj: any) => void) => {

            const self = this;
            co(function* () {
                yield self.geVistorService().login(profile.id, profile.displayName, 'Google');
            });

            return done(null, profile);
        }));

        passport.use(new GithubStrategy({
            callbackURL: argv.prod ? config.production.oauth2.github.callback : config.development.oauth2.github.callback,
            clientID: argv.prod ? config.production.oauth2.github.clientId : config.development.oauth2.github.clientId,
            clientSecret: argv.prod ? config.production.oauth2.github.clientSecret : config.development.oauth2.github.clientSecret,
        }, (accessToken: string, refreshToken: string, profile: any, done: (err: Error, obj: any) => void) => {

            const self = this;
            co(function* () {
                yield self.geVistorService().login(profile.id, profile.displayName, 'Github');
            });

            return done(null, profile);
        }));

        // Configure static content
        app.use('/static', express.static(path.join(__dirname, 'public')));
    }

    private geVistorService(): VisitorService {
        const host = argv.prod ? config.production.database.host : config.development.database.host;
        const username = argv.prod ? config.production.database.username : config.development.database.username;
        const password = argv.prod ? config.production.database.password : config.development.database.password;
        const visitorRepository = new VisitorRepository(host, username, password);
        const visitorService = new VisitorService(visitorRepository);
        return visitorService;
    }

    private configureRoutes(app: express.Express) {
        app.use("/", mainRoute);

        app.get('/auth/linkedin', passport.authenticate('linkedin', {
            failureRedirect: '/',
            session: true,
            successRedirect: '/',
        }));

        app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
            failureRedirect: '/',
            session: true,
            successRedirect: '/',
        }), (req: express.Request, res: express.Response) => {
            res.redirect('/');
        });

        app.get('/auth/google', passport.authenticate('google', {
            failureRedirect: '/',
            scope: ['profile'],
            session: true,
            successRedirect: '/',
        }));

        app.get('/auth/google/callback', passport.authenticate('google', {
            failureRedirect: '/',
            session: true,
            successRedirect: '/',
        }), (req: express.Request, res: express.Response) => {
            res.redirect('/');
        });

        app.get('/auth/github', passport.authenticate('github', {
            failureRedirect: '/',
            session: true,
            successRedirect: '/',
        }));

        app.get('/auth/github/callback', passport.authenticate('github', {
            failureRedirect: '/',
            session: true,
            successRedirect: '/',
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

const api = new WebApi(express(), argv.port || 3000);
api.run();
logger.info(`listening on ${argv.port || 3000}`);

const job = new cron.CronJob(argv.prod ? config.production.scheduledTask.cron.pattern : config.development.scheduledTask.cron.pattern, () => {
    const host = argv.prod ? config.production.database.host : config.development.database.host;
    const username = argv.prod ? config.production.database.username : config.development.database.username;
    const password = argv.prod ? config.production.database.password : config.development.database.password;
    const postRepository = new PostRepository(host, username, password);
    const postService = new PostService(postRepository, argv.prod ? config.production.users : config.development.users, argv.prod ? config.production.github.username : config.development.github.username, argv.prod ? config.production.github.password : config.development.github.password, argv.prod ? config.production.domain : config.development.domain);

    postService.scrapeGithub().then(() => {
        logger.info('PostService.scrapeGithub - Done');
    });
}, null, true);

job.start();
