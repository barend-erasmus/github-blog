// Imports
import * as path from 'path';
import * as winston from 'winston';

// Import configurations
let config = require('./config').config;

const argv = require('yargs').argv;

if (argv.prod) {
  config = require('./config.prod').config;
}

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'debug' }),
    new (winston.transports.File)({
      filename: path.join(config.logging.path, 'github_blog_api.log'),
      level: 'debug',
    }),
  ],
});

// Exports
export { logger };
