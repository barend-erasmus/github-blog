// Imports
import * as MarkdownIt from 'markdown-it';
import * as rp from 'request-promise';

// Imports models
import { Post } from './../entities/post';

// Imports interfaces
import { IPostRepository } from './../repositories/post';
import { IWordRepository } from './../repositories/word';

// Import services
import { ShareService } from './share';

export class PostService {

    private shareService = new ShareService();

    constructor(private postRepository: IPostRepository, private wordRepository: IWordRepository, private users: string[], private username: string, private password: string, private domain: string) {

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

        const post: Post = await this.postRepository.find(key);

        return post;
    }

    public async search(query: string): Promise<Post[]> {

        const words: string[] = query.split(' ');

        const results: {} = {};

        for (const word of words) {
            const wordResult: {} = await this.wordRepository.find(word);

            for (const key of Object.keys(wordResult)) {
                if (results[key]) {
                    results[key].count = results[key].count + wordResult[key].count;
                } else {
                    results[key] = wordResult[key];
                }
            }
        }

        const keys: string[] = Object.keys(results).sort((a, b) => {
            return results[b].count - results[a].count;
        });

        return keys.map((x) => results[x].post);
    }

    public async create(post: Post): Promise<Post> {

        const existingPost: Post = await this.postRepository.find(post.key);

        if (existingPost) {
            await this.postRepository.update(post);
        } else {
            await this.postRepository.insert(post);
        }

        const words: {} = {};

        post.body.replace(new RegExp(/[a-zA-Z]+/g), (match: string) => {
            if (words[match]) {
                words[match] = words[match] + 1;
            } else {
                words[match] = 1;
            }

            return null;
        });


        for (const word of Object.keys(words)) {
            if (word && word.length > 2) {
                try {
                    await this.wordRepository.insert(post.key, word.toLowerCase(), words[word]);
                } catch (err) {

                }
            }
        }

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

                        await this.create(post);
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
