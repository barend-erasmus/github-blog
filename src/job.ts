// Imports
import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));
const argv = yargs.argv;

// Imports repositories
import { PostRepository } from './repositories/sequelize/post';
import { WordRepository } from './repositories/sequelize/word';

// Imports services
import { PostService } from './services/post';

// Imports logger
import { logger } from './logger';

const host = config.database.host;
const username = config.database.username;
const password = config.database.password;
const postRepository = new PostRepository(host, username, password);
const wordRepository = new WordRepository(host, username, password);
const postService = new PostService(postRepository, wordRepository, config.users, config.github.username, config.github.password, config.domain);

postRepository.sync().then(() => {
    return postService.scrapeGithub();
}).then(() => {
    logger.info('PostService.scrapeGithub - Done');
    postRepository.close();
});
