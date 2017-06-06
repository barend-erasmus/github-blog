// Imports
import co = require('co');
import path = require('path');
import request = require('request');
import markdown = require("markdown");
import MarkdownIt = require('markdown-it');
import rp = require('request-promise');
import fs = require('graceful-fs');
import moment = require('moment');

// Imports models
import { Post } from './../models/post';

export class PostService {

    private users: string[] = ['developersworkspace', 'barend-erasmus'];

    public listPosts(): Promise<Post[]> {

        const self = this;
        
        return co(function* () {

            const posts: Post[] = [];
            const jsonFilename = __dirname + './../temp/' + moment().format('YYYY-MM-DD-HH') + '.json';

            if (fs.existsSync(jsonFilename)) {
                const json = fs.readFileSync(jsonFilename);

                return JSON.parse(json);
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
                        
                    }else {

                    }
                });
            }


            return posts;
        });
    }

    public findPost(id: string): Promise<Post> {
        // const post = this.posts.find((x) => x.id === id);

        // const md = new MarkdownIt();

        // return new Promise((resolve: (obj: any) => void, reject: (err: Error) => void) => {
        //     request(post.uri, (error: Error, response: any, body: string) => {
        //         if (error) {
        //             reject(error);
        //             return;
        //         }

        //         resolve({
        //             author: post.author,
        //             description: post.description,
        //             html: md.render(body),
        //             id: post.id,
        //             timestamp: post.timestamp,
        //             title: post.title,
        //             uri: post.uri,
        //         });
        //     });
        // });
        return null;
    }

}
