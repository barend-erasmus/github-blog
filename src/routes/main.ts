// Imports
import { Express, Request, Response } from "express";
import * as express from 'express';
import * as request from 'request';
import * as RSS from 'rss';
import * as yargs from 'yargs';

import * as fs from 'fs';
import * as path from 'path';
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './../config.json'), 'utf8'));

const argv = yargs.argv;

// Imports repositories
import { PostRepository } from './../repositories/sequelize/post';
import { WordRepository } from './../repositories/sequelize/word';

// Imports services
import { PostService } from './../services/post';

// Imports models
import { Post } from './../entities/post';

function getPostService(): PostService {
    const host = config.database.host;
    const username = config.database.username;
    const password = config.database.password;
    const postRepository = new PostRepository(host, username, password);
    const wordRepository = new WordRepository(host, username, password);
    const postService = new PostService(postRepository, wordRepository, config.users, config.github.username, config.github.password, config.domain);
    return postService;
}

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: () => void) => {
    const postService = getPostService();

    const posts: Post[] = req.query.q? await postService.search(req.query.q) : await postService.list();

    res.render('home', {
        description: config.pages.home.title,
        posts,
        title: 'Home',
        user: req.user,
    });
});

router.get('/about', (req: Request, res: Response, next: () => void) => {
    res.render('about', {
        description: config.pages.about.title,
        title: 'About',
    });
});

router.get('/contact', (req: Request, res: Response, next: () => void) => {
    res.render('contact', {
        description: config.pages.contact.title,
        title: 'Contact',
    });
});

router.get('/post/:id', async (req: Request, res: Response, next: () => void) => {
    const postService = getPostService();

    const post: Post = await postService.find(req.params.id);

    res.render('post', {
        description: post.description,
        post,
        title: post.title,
    });
});

router.get('/rss', async (req: Request, res: Response, next: () => void) => {
    const postService = getPostService();

    const posts: Post[] = await postService.list();

    const feed = new RSS({
        description: config.pages.about.title,
        feed_url: `${config.domain}/rss`,
        site_url: `${config.domain}`,
        title: config.domain,
    });

    for (const post of posts) {
        feed.item({
            author: post.author,
            date: post.publishedTimestamp,
            description: post.description,
            title: post.title,
            url: `${config.domain}/post/${post.key}`,
        });
    }

    const xml = feed.xml({ indent: true });

    res.setHeader('content-type', 'application/rss+xml');
    res.send(xml);
});

export = router;
