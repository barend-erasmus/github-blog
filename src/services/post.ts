// Imports
import co = require('co');
import path = require('path');
import request = require('request');
import markdown = require("markdown");
import MarkdownIt = require('markdown-it');
import rp = require('request-promise');
import fs = require('graceful-fs');
import moment = require('moment');

// Import configurations
let config = require('./../config').config;

const argv = require('yargs').argv;

if (argv.prod) {
  config = require('./../config.prod').config;
}

// Imports models
import { Post } from './../models/post';

export class PostService {

    private users: string[] = ['developersworkspace', 'barend-erasmus'];

    public listPosts(): Promise<Post[]> {

        const self = this;

        return co(function* () {

            const posts: Post[] = [];
            const jsonFilename = path.join(config.tempDir, moment().format('YYYY-MM-DD-HH') + '.json');

            if (fs.existsSync(jsonFilename)) {
                const json = fs.readFileSync(jsonFilename);

                return JSON.parse(json).sort((a: Post, b: Post) => {
                    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
                });
            }

            for (const username of self.users) {

                const htmlForRepositories: string = yield rp({
                    uri: `https://api.github.com/users/${username}/repos`,
                    headers: {
                        'User-Agent': 'Request-Promise',
                        'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6TWlkZXJpY0s5Ng=='
                    }
                });

                const repositories: any[] = JSON.parse(htmlForRepositories);
                for (const repository of repositories) {
                    const htmlForRepositoryContents: string = yield rp({
                        uri: `${repository.url}/contents`,
                        headers: {
                            'User-Agent': 'Request-Promise',
                            'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6TWlkZXJpY0s5Ng=='
                        }
                    });
                    const repositoryContents: any[] = JSON.parse(htmlForRepositoryContents);

                    const readmeFile = repositoryContents.find((x) => x.path === 'README.md');

                    const blogDataFile = repositoryContents.find((x) => x.path === 'blog-data');

                    if (blogDataFile) {

                        const htmlForBody: string = yield rp({
                            uri: `${readmeFile.download_url}`,
                            headers: {
                                'User-Agent': 'Request-Promise',
                                'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6TWlkZXJpY0s5Ng=='
                            }
                        });


                        const htmlForBlogData: string = yield rp({
                            uri: `${blogDataFile.download_url}`,
                            headers: {
                                'User-Agent': 'Request-Promise',
                                'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6TWlkZXJpY0s5Ng=='
                            }
                        });

                        const blogData = JSON.parse(htmlForBlogData);

                        posts.push(new Post(repository.full_name.replace('/', '-at-'), blogData.title, repository.description, htmlForBody, repository.owner.login, repository.owner.avatar_url, repository.pushed_at));
                    }
                }

            }

            if (!fs.existsSync(jsonFilename)) {
                fs.writeFile(jsonFilename, JSON.stringify(posts), (err: Error) => {
                    if (err) {
                        console.log(err);
                    } else {
                    }
                });
            }


            return posts.sort((a: Post, b: Post) => {
                return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
            });
        });
    }

    public findPost(id: string): Promise<Post> {

        const self = this;

        return co(function* () {
            const posts: Post[] = yield self.listPosts();

            const post = posts.find((x) => x.id === id);

            const md = new MarkdownIt();

            post.body = md.render(post.body);

            return post;

        });
    }

}
