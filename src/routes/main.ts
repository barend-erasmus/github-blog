// Imports
import { Express, Request, Response } from "express";
import * as express from 'express';
import * as request from 'request';
import * as yargs from 'yargs';
import * as RSS from 'rss';

import * as fs from 'fs';
import * as path from 'path';
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './../config.json'), 'utf8'));

const argv = yargs.argv;

// Imports repositories
import { PostRepository } from './../repositories/sequelize/post';

// Imports services
import { PostService } from './../services/post';

// Imports models
import { Post } from './../entities/post';

function getPostService(): PostService {
    const host = argv.prod ? config.production.database.host : config.development.database.host;
    const username = argv.prod ? config.production.database.username : config.development.database.username;
    const password = argv.prod ? config.production.database.password : config.development.database.password;
    const postRepository = new PostRepository(host, username, password);
    const postService = new PostService(postRepository, argv.prod ? config.production.users : config.development.users, argv.prod ? config.production.github.username : config.development.github.username, argv.prod ? config.production.github.password : config.development.github.password, argv.prod ? config.production.domain : config.development.domain);
    return postService;
}

const router = express.Router();

router.get('/', (req: Request, res: Response, next: () => void) => {
    const postService = getPostService();

    postService.list().then((posts: Post[]) => {
        res.render('home', {
            description: argv.prod ? config.production.pages.home.title : config.development.pages.home.title,
            posts,
            title: 'Home',
            user: req.user,
        });
    });
});

router.get('/about', (req: Request, res: Response, next: () => void) => {
    const postService = getPostService();

    res.render('about', {
        description: argv.prod ? config.production.pages.about.title : config.development.pages.about.title,
        title: 'About',
    });
});

router.get('/contact', (req: Request, res: Response, next: () => void) => {
    res.render('contact', {
        description: argv.prod ? config.production.pages.contact.title : config.development.pages.contact.title,
        title: 'Contact',
    });
});

router.get('/post/:id', (req: Request, res: Response, next: () => void) => {
    const postService = getPostService();

    postService.find(req.params.id).then((post: Post) => {
        res.render('post', {
            description: post.description,
            post,
            title: post.title,
        });
    });
});

router.get('/rss', (req: Request, res: Response, next: () => void) => {
    const postService = getPostService();

    postService.list().then((posts: Post[]) => {

        const feed = new RSS({
            title: argv.prod ? config.production.domain : config.development.domain,
            description: argv.prod ? config.production.pages.about.title : config.development.pages.about.title,
            feed_url: `${argv.prod ? config.production.domain : config.development.domain}/rss`,
            site_url: `${argv.prod ? config.production.domain : config.development.domain}`,
        });

        for (const post of posts) {
            feed.item({
                title: post.title,
                description: post.description,
                url: `${argv.prod ? config.production.domain : config.development.domain}/post/${post.key}`,
                author: post.author,
                date: post.publishedTimestamp,
            });
        }

        const xml = feed.xml({indent: true});

        res.setHeader('content-type', 'application/rss+xml');
        res.send(xml);
    });
});

export = router;
