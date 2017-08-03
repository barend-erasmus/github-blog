// Imports
import co = require('co');
import MarkdownIt = require('markdown-it');
import rp = require('request-promise');

// Imports models
import { Post } from './../entities/post';

// Imports interfaces
import { IPostRepository } from './../repositories/post';

// Import services
import { ShareService } from './share';

export class PostService {

    private shareService = new ShareService();

    constructor(private postRepository: IPostRepository, private users: string[], private username: string, private password: string, private domain: string) {

    }

    public list(): Promise<Post[]> {
        const self = this;
        return co(function* () {
            let result = yield self.postRepository.list();
            if (result.length === 0) {
                yield self.scrapeGithub();
                result = yield self.postRepository.list();
            }
            return result;
        });
    }

    public find(key: string): Promise<Post> {
        const self = this;
        return co(function* () {

            const post = yield self.postRepository.find(key);

            const md = new MarkdownIt();

            post.body = md.render(post.body);

            return post;
        });
    }

    public scrapeGithub(): Promise<void> {
        const self = this;
        return co(function* () {

            for (const username of self.users) {

                let page = 1;

                while (page < 10) {
                    const repositories: any[] = yield rp({
                        headers: {
                            'Authorization': `Basic ${self.getAuthorizationHeader()}`,
                            'User-Agent': 'Request-Promise',
                        },
                        json: true,
                        uri: `https://api.github.com/users/${username}/repos?page=${page}`,
                    });

                    if (repositories.length === 0) {
                        break;
                    }

                    for (const repository of repositories) {

                        const repositoryContents: any[] = yield rp({
                            headers: {
                                'Authorization': `Basic ${self.getAuthorizationHeader()}`,
                                'User-Agent': 'Request-Promise',
                            },
                            json: true,
                            uri: `${repository.url}/contents`,
                        });

                        const readmeFile = repositoryContents.find((x) => x.path === 'README.md');

                        const blogDataFile = repositoryContents.find((x) => x.path === 'blog-data');

                        if (blogDataFile) {

                            const htmlForBody: string = yield rp({
                                headers: {
                                    'Authorization': `Basic ${self.getAuthorizationHeader()}`,
                                    'User-Agent': 'Request-Promise',
                                },
                                uri: `${readmeFile.download_url}`,
                            });

                            const htmlForBlogData: string = yield rp({
                                headers: {
                                    'Authorization': `Basic ${self.getAuthorizationHeader()}`,
                                    'User-Agent': 'Request-Promise',
                                },
                                uri: `${blogDataFile.download_url}`,
                            });

                            const blogData = JSON.parse(htmlForBlogData);

                            const linkedInShareCount = yield self.shareService.linkedIn(`${self.domain}/post/${repository.full_name.replace('/', '-at-')}`);

                            const post = new Post(repository.full_name.replace('/', '-at-'), blogData.title, repository.description, htmlForBody, blogData.image, blogData.category, repository.owner.login, repository.owner.avatar_url, repository.pushed_at, linkedInShareCount);
                            const existingPost = yield self.postRepository.find(post.key);
                            if (existingPost) {
                                yield self.postRepository.update(post);
                            } else {
                                yield self.postRepository.insert(post);
                            }
                        }
                    }

                    page = page + 1;
                }

            }
            return;
        });
    }

    private getAuthorizationHeader(): string {
        return new Buffer(`${this.username}:${this.password}`).toString('base64');
    }
}
