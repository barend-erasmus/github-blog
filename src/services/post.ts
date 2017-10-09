// Imports
import * as MarkdownIt from 'markdown-it';
import * as rp from 'request-promise';

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

    public async list(): Promise<Post[]> {
        let result = await this.postRepository.list();
        if (result.length === 0) {
            await this.scrapeGithub();
            result = await this.postRepository.list();
        }
        return result;
    }

    public async find(key: string): Promise<Post> {

        const post = await this.postRepository.find(key);

        return post;
    }

    public async scrapeGithub(): Promise<void> {

        for (const username of this.users) {

            let page = 1;

            while (page < 10) {
                const repositories: any[] = await rp({
                    headers: {
                        'Authorization': `Basic ${this.getAuthorizationHeader()}`,
                        'User-Agent': 'Request-Promise',
                    },
                    json: true,
                    uri: `https://api.github.com/users/${username}/repos?page=${page}`,
                });

                if (repositories.length === 0) {
                    break;
                }

                for (const repository of repositories) {

                    const repositoryContents: any[] = await rp({
                        headers: {
                            'Authorization': `Basic ${this.getAuthorizationHeader()}`,
                            'User-Agent': 'Request-Promise',
                        },
                        json: true,
                        uri: `${repository.url}/contents`,
                    });

                    const readmeFile = repositoryContents.find((x) => x.path === 'README.md');

                    const blogDataFile = repositoryContents.find((x) => x.path === 'blog-data');

                    if (blogDataFile) {

                        const rawReadmeBody: string = await rp({
                            headers: {
                                'Authorization': `Basic ${this.getAuthorizationHeader()}`,
                                'User-Agent': 'Request-Promise',
                            },
                            uri: `${readmeFile.download_url}`,
                        });

                        const md = new MarkdownIt();
                        let htmlBody = md.render(rawReadmeBody);

                        const rawBlogData: string = await rp({
                            headers: {
                                'Authorization': `Basic ${this.getAuthorizationHeader()}`,
                                'User-Agent': 'Request-Promise',
                            },
                            uri: `${blogDataFile.download_url}`,
                        });

                        const blogData = JSON.parse(rawBlogData);

                        if (blogData.htmlPage) {
                            htmlBody = await rp({
                                headers: {
                                    'Authorization': `Basic ${this.getAuthorizationHeader()}`,
                                    'User-Agent': 'Request-Promise',
                                },
                                uri: `${blogData.htmlPage}`,
                            });
                        }

                        const linkedInShareCount = await this.shareService.linkedIn(`${this.domain}/post/${repository.full_name.replace('/', '-at-')}`);

                        const post = new Post(repository.full_name.replace('/', '-at-'), blogData.title, repository.description, htmlBody, blogData.image, blogData.category, repository.owner.login, repository.owner.avatar_url, repository.pushed_at, linkedInShareCount);
                        const existingPost = await this.postRepository.find(post.key);
                        if (existingPost) {
                            await this.postRepository.update(post);
                        } else {
                            await this.postRepository.insert(post);
                        }
                    }
                }

                page = page + 1;
            }

        }
        return;
    }

    public getAuthorizationHeader(): string {
        return new Buffer(`${this.username}:${this.password}`).toString('base64');
    }
}
