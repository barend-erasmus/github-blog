// Imports
import express = require("express");
import * as cookieSession from 'cookie-session';
import * as passport from 'passport';
import * as GithubStrategy from 'passport-github';
import * as GoogleStrategy from 'passport-google-oauth20';
import * as LinkedInStrategy from 'passport-linkedin';
import path = require('path');
import * as co from 'co';
import * as cron from 'cron';
import * as yargs from 'yargs';

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
            callbackURL: argv.prod ? "https://developersworkspace.co.za/auth/linkedin/callback" : "http://localhost:3000/auth/linkedin/callback",
            consumerKey: '861jdkiau0rqs5',
            consumerSecret: 'x7x0u5FK5Pz9V5nB',
        }, (token: string, tokenSecret: string, profile: any, done: (err: Error, obj: any) => void) => {

            const self = this;
            co(function* () {
                yield self.geVistorService().login(profile.id, profile.displayName, 'LinkedIn');
            });

            return done(null, profile);
        }));

        passport.use(new GoogleStrategy({
            callbackURL: argv.prod ? "https://developersworkspace.co.za/auth/google/callback" : "http://localhost:3000/auth/google/callback",
            clientID: '747263281118-2gquah79jdtp5l6k7flonm694msp7254.apps.googleusercontent.com',
            clientSecret: '2fcRUL7yghAtGE5mU9_1WUqA',
        }, (accessToken: string, refreshToken: string, profile: any, done: (err: Error, obj: any) => void) => {

            const self = this;
            co(function* () {
                yield self.geVistorService().login(profile.id, profile.displayName, 'Google');
            });

            return done(null, profile);
        }));

        passport.use(new GithubStrategy({
            callbackURL: argv.prod ? "https://developersworkspace.co.za/auth/github/callback" : "http://localhost:3000/auth/github/callback",
            clientID: argv.prod ? '2e5099132d37735f7e1e' : '1ce4c2e208e9ed338ec6',
            clientSecret: argv.prod ? '29d9ab22b8445f04808bd142dc1550adc0e0082a' : '187d1ce0e58a3708e7a9efb4c644dd14dd17d876',
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
        const host = 'developersworkspace.co.za';
        const username = 'github-blog';
        const password = 'u?a@682P6b#F@Jj8';
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

const job = new cron.CronJob('0 0 * * * *', () => {
    const host = 'developersworkspace.co.za';
    const username = 'github-blog';
    const password = 'u?a@682P6b#F@Jj8';
    const postRepository = new PostRepository(host, username, password);
    const postService = new PostService(postRepository);

    postService.scrapeGithub().then(() => {
        logger.info('PostService.scrapeGithub - Done');
    });
}, null, true);

job.start();
