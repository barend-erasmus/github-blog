// Imports
import * as cookieSession from 'cookie-session';
import * as cron from 'cron';
import * as express from 'express';
import * as helmet from 'helmet';
import * as rp from 'request-promise';
import * as yargs from 'yargs';

import * as fs from 'fs';
import * as path from 'path';
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));

// Imports repositories
import { PostRepository } from './repositories/sequelize/post';
import { WordRepository } from './repositories/sequelize/word';

// Imports services
import { PostService } from './services/post';

// Imports middleware
import * as exphbs from 'express-handlebars';
import * as robots from 'express-robots';
import * as expressWinston from 'express-winston';

// Imports routes
import * as mainRoute from './routes/main';

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

        // Configure Helmet
        app.use(helmet());

        // Configure view engine
        app.engine('handlebars', exphbs({
            defaultLayout: 'main',
            layoutsDir: path.join(__dirname, 'views/layouts'),
        }));

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'handlebars');

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

        // Configure static content
        app.use('/static', express.static(path.join(__dirname, 'public')));

        // Configure robots file
        app.use(robots({ UserAgent: '*', Disallow: '' }));

        app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.removeHeader('X-Powered-By');
            next();
        });

    }

    private configureRoutes(app: express.Express) {
        app.use("/", mainRoute);
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

const job = new cron.CronJob(config.scheduledTask.cron.pattern, () => {
    const host = config.database.host;
    const username = config.database.username;
    const password = config.database.password;
    const postRepository = new PostRepository(host, username, password);
    const wordRepository = new WordRepository(host, username, password);
    const postService = new PostService(postRepository, wordRepository, config.users, config.github.username, config.github.password, config.domain);

    postService.scrapeGithub().then(() => {
        logger.info('PostService.scrapeGithub - Done');
    });
}, null, true);

job.start();

const jobPostService = new PostService(
    new PostRepository(
        config.database.host,
        config.database.username,
        config.database.password,
    ),
    new WordRepository(
        config.database.host,
        config.database.username,
        config.database.password,
    ),
    config.users,
    config.github.username,
    config.github.password,
    config.domain);

rp({
    headers: {
        'Authorization': `Basic ${jobPostService.getAuthorizationHeader()}`,
        'User-Agent': 'Request-Promise',
    },
    json: true,
    uri: `https://api.github.com/users/${config.users[0]}/repos?page=1`,
}).then(() => {
    logger.info('Valid Github Credentials');
}).catch((err: Error) => {
    logger.error(err.message, err);
    process.exit(-1);
});
