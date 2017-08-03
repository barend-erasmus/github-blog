// Imports repositories
import { PostRepository } from './repositories/sequelize/post';

// Imports services
import { PostService } from './services/post';

// Imports logger
import { logger } from './logger';

const host = 'developersworkspace.co.za';
const username = 'github-blog';
const password = 'u?a@682P6b#F@Jj8';
const postRepository = new PostRepository(host, username, password);
const postService = new PostService(postRepository);

postRepository.sync().then(() => {
    return postService.scrapeGithub();
}).then(() => {
    logger.info('PostService.scrapeGithub - Done');
});