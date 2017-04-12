import request = require('request');
import markdown = require("markdown");
import MarkdownIt = require('markdown-it');

export class PostService {

    private posts = [
        {
            author: {
                name: 'Barend Erasmus',
                uri: 'https://avatars2.githubusercontent.com/u/17405891?v=3&s=460',
            },
            description: 'Explaining the single thread event loop in context of Node.',
            id: 'node-explained',
            timestamp: '11 April 2017',
            title: 'Node Explained',
            uri: 'https://raw.githubusercontent.com/developersworkspace/node-explained/master/README.md',
        },
        {
            author: {
                name: 'Barend Erasmus',
                uri: 'https://avatars2.githubusercontent.com/u/17405891?v=3&s=460',
            },
            description: 'Visualize the latest trends recommended by the community.',
            id: 'tech-radar',
            timestamp: '17 March 2017',
            title: 'Tech Radar',
            uri: 'https://raw.githubusercontent.com/developersworkspace/TechRadar/master/README.md',
        },
        {
            author: {
                name: 'Barend Erasmus',
                uri: 'https://avatars2.githubusercontent.com/u/17405891?v=3&s=460',
            },
            description: 'Have you ever wondered how DNS works?',
            id: 'how-does-dns-work',
            timestamp: '2 March 2017',
            title: 'How does DNS work?',
            uri: 'https://raw.githubusercontent.com/developersworkspace/OpenDocs/master/How-Does-DNS-Work/README.md',
        },
        {
            author: {
                name: 'Barend Erasmus',
                uri: 'https://avatars2.githubusercontent.com/u/17405891?v=3&s=460',
            },
            description: 'A simple guide on how to get started with linux',
            id: 'the-basics-of-linux',
            timestamp: '20 February 2017',
            title: 'The Basics of Linux',
            uri: 'https://raw.githubusercontent.com/developersworkspace/OpenDocs/master/The-Basics-Of-Linux/README.md',
        },
        {
            author: {
                name: 'Barend Erasmus',
                uri: 'https://avatars2.githubusercontent.com/u/17405891?v=3&s=460',
            },
            description: 'Setting-up docker on a Windows and Linux machine',
            id: 'getting-started-with-docker',
            timestamp: '19 February 2017',
            title: 'Getting Started with Docker',
            uri: 'https://raw.githubusercontent.com/developersworkspace/OpenDocs/master/Getting-Started-With-Docker/README.md',
        },
        {
            author: {
                name: 'Barend Erasmus',
                uri: 'https://avatars2.githubusercontent.com/u/17405891?v=3&s=460',
            },
            description: 'Always searching for commands',
            id: 'docker-cheatsheet',
            timestamp: '12 February 2017',
            title: 'Docker Cheatsheet',
            uri: 'https://raw.githubusercontent.com/developersworkspace/OpenDocs/master/Docker-Cheatsheet/README.md',
        },
        {
            author: {
                name: 'Barend Erasmus',
                uri: 'https://avatars2.githubusercontent.com/u/17405891?v=3&s=460',
            },
            description: 'Generating free SSL certificates',
            id: 'lets-encrypt-tutorial',
            timestamp: '10 February 2017',
            title: 'Let\'s Encrypt Tutorial',
            uri: 'https://raw.githubusercontent.com/developersworkspace/OpenDocs/master/Lets-Encrypt-Tutorial/README.md',
        },
        {
            author: {
                name: 'Barend Erasmus',
                uri: 'https://avatars2.githubusercontent.com/u/17405891?v=3&s=460',
            },
            description: 'Confused by commit, push, pull....',
            id: 'commit-push-pull',
            timestamp: '8 February 2017',
            title: 'Commit, Push, Pull',
            uri: 'https://raw.githubusercontent.com/developersworkspace/OpenDocs/master/Commit-Push-Pull/README.md',
        },
    ];

    public listPosts(): any[] {
        return this.posts;
    }

    public findPost(id: string): Promise<any> {
        const post = this.posts.find((x) => x.id === id);

        const md = new MarkdownIt();

        return new Promise((resolve: (obj: any) => void, reject: (err: Error) => void) => {
            request(post.uri, (error: Error, response: any, body: string) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    author: post.author,
                    description: post.description,
                    html: md.render(body),
                    id: post.id,
                    timestamp: post.timestamp,
                    title: post.title,
                    uri: post.uri,
                });
            });
        });
    }

}
