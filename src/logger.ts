// Imports
import * as path from 'path';
import * as winston from 'winston';
const argv = require('yargs').argv;

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'debug' }),
    new (winston.transports.File)({
      filename: path.join(argv.prod? '/logs/' : './', 'github_blog.log'),
      level: 'debug',
    }),
  ],
});

// Exports
export { logger };
