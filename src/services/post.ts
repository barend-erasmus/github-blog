// Imports
import co = require('co');
import path = require('path');
import request = require('request');
import markdown = require("markdown");
import MarkdownIt = require('markdown-it');
import rp = require('request-promise');
import fs = require('graceful-fs');
import moment = require('moment');

// Imports logger
import { logger } from './../logger';

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
            let jsonFilename = path.join(config.tempDir, moment().utc().format('YYYY-MM-DD-HH') + '.json');

            const files: string[] = fs.readdirSync(config.tempDir).filter((x) => x !== '.gitkeep').sort();

            if (files.length === 0) {
                yield self.scrapeGithub();
            }

            if (!fs.existsSync(jsonFilename)) {
                self.scrapeGithub();

                jsonFilename = path.join(config.tempDir, files[files.length - 1]);
            }


            const json = fs.readFileSync(jsonFilename);

            return JSON.parse(json).sort((a: Post, b: Post) => {
                return moment(b.timestamp).utc().toDate().getTime() - moment(a.timestamp).utc().toDate().getTime();
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

    private scrapeGithub(): Promise<void> {
        const self = this;

        return co(function* () {

            const posts: Post[] = [];
            const jsonFilename = path.join(config.tempDir, moment().utc().format('YYYY-MM-DD-HH') + '.json');

            if (fs.existsSync(jsonFilename)) {
                return;
            }

            for (const username of self.users) {

                let page = 1;

                while (page < 10) {
                    const repositories: any[] = yield rp({
                        uri: `https://api.github.com/users/${username}/repos?page=${page}`,
                        headers: {
                            'User-Agent': 'Request-Promise',
                            'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6TWlkZXJpY0s5Ng=='
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
                                'Authorization': 'Basic YmFyZW5kLWVyYXNtdXM6TWlkZXJpY0s5Ng=='
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

                    page = page + 1;
                }

            }

            if (!fs.existsSync(jsonFilename)) {
                fs.writeFileSync(jsonFilename, JSON.stringify(posts));
            }


            return;
        });
    }

}
