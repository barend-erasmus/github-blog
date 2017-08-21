// Imports
import { Express, Request, Response } from "express";
import * as express from 'express';
import * as request from 'request';
import * as yargs from 'yargs';

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
            description: 'Cape Town, South Africa based Software Engineer sharing knowledge, experiences and ideas.',
            posts,
            title: 'Home',
            user: req.user,
        });
    });
});

router.get('/about', (req: Request, res: Response, next: () => void) => {
    const postService = getPostService();

    res.render('about', {
        description: 'What is Developer\'s Workspace all about? Developer\'s Workspace vision is to create MIT licensed software solution to allow developers to focus on their idea instead of other requirements such as authentication',
        title: 'About',
    });
});

router.get('/projects', (req: Request, res: Response, next: () => void) => {
    res.render('projects', {
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.',
        title: 'Projects',
    });
});

router.get('/contact', (req: Request, res: Response, next: () => void) => {
    res.render('contact', {
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.',
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

router.get('/projects/url-shortener', (req: Request, res: Response, next: () => void) => {
    res.render('./projects/url-shortener', {
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.',
        title: 'URL Shortener',
    });
});

router.get('/projects/html-converter', (req: Request, res: Response, next: () => void) => {
    res.render('./projects/html-converter', {
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.',
        title: 'HTML Converter',
    });
});

export = router;
