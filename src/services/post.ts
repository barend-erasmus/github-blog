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

    private users: string[] = ['developersworkspace', 'barend-erasmus'];
    private shareService = new ShareService();

    constructor(private postRepository: IPostRepository) {

    }

    public list(): Promise<Post[]> {
        const self = this;
        return co(function* () {
            let result =  yield self.postRepository.list();
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
                        uri: `https://api.github.com/users/${username}/repos?page=${page}`,
                        headers: {
                            'User-Agent': 'Request-Promise',
                            'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6R2l0aHViTWlkZXJpY0s5Ng=='
                        },
                        json: true
                    });

                    if (repositories.length === 0) {
                        break;
                    }

                    for (const repository of repositories) {

                        const repositoryContents: any[] = yield rp({
                            uri: `${repository.url}/contents`,
                            headers: {
                                'User-Agent': 'Request-Promise',
                                'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6R2l0aHViTWlkZXJpY0s5Ng=='
                            },
                            json: true
                        });

                        const readmeFile = repositoryContents.find((x) => x.path === 'README.md');

                        const blogDataFile = repositoryContents.find((x) => x.path === 'blog-data');

                        if (blogDataFile) {

                            const htmlForBody: string = yield rp({
                                uri: `${readmeFile.download_url}`,
                                headers: {
                                    'User-Agent': 'Request-Promise',
                                    'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6R2l0aHViTWlkZXJpY0s5Ng=='
                                }
                            });


                            const htmlForBlogData: string = yield rp({
                                uri: `${blogDataFile.download_url}`,
                                headers: {
                                    'User-Agent': 'Request-Promise',
                                    'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6R2l0aHViTWlkZXJpY0s5Ng=='
                                }
                            });

                            const blogData = JSON.parse(htmlForBlogData);

                            const linkedInShareCount = yield self.shareService.linkedIn(`https://developersworkspace.co.za/post/${repository.full_name.replace('/', '-at-')}`);

                            const post = new Post(repository.full_name.replace('/', '-at-'), blogData.title, repository.description, htmlForBody, repository.owner.login, repository.owner.avatar_url, repository.pushed_at, linkedInShareCount);
                            const existingPost = yield self.postRepository.find(post.key);
                            if (existingPost) {
                                yield self.postRepository.update(post);
                            }else {
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
}
