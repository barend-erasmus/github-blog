// Imports
import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));
const argv = yargs.argv;

// Imports repositories
import { PostRepository } from './repositories/sequelize/post';

// Imports services
import { PostService } from './services/post';

// Imports logger
import { logger } from './logger';

const host = argv.prod ? config.production.database.host : config.development.database.host;
const username = argv.prod ? config.production.database.username : config.development.database.username;
const password = argv.prod ? config.production.database.password : config.development.database.password;
const postRepository = new PostRepository(host, username, password);
const postService = new PostService(postRepository, argv.prod ? config.production.users : config.development.users, argv.prod ? config.production.github.username : config.development.github.username, argv.prod ? config.production.github.password : config.development.github.password, argv.prod ? config.production.domain : config.development.domain);
postRepository.sync().then(() => {
    return postService.scrapeGithub();
}).then(() => {
    logger.info('PostService.scrapeGithub - Done');
});
