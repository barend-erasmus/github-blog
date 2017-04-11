// Imports
import express = require("express");
import path = require('path');

// Imports middleware
import expressWinston = require('express-winston');
import exphbs = require('express-handlebars');

// Imports routes
import mainRoute = require('./routes/main');

// Imports logger
import { logger } from './logger';

// Imports configurations
import { config } from './config';

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

        app.engine('handlebars', exphbs({
            defaultLayout: 'main',
            layoutsDir: path.join(__dirname, 'views/layouts'),
        }));

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'handlebars');

        // Configure express-winston
        app.use(expressWinston.logger({
            meta: false,
            msg: 'HTTP Request: {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
            winstonInstance: logger,
        }));

        app.use('/static', express.static(path.join(__dirname, 'public')))
;    }

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

const port = 3000;
const api = new WebApi(express(), port);
api.run();
logger.info(`Listening on ${port}`);
