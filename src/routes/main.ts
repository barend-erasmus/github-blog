// Imports
import { Express, Request, Response } from "express";
import * as express from 'express';
import * as request from 'request';

// Imports repositories
import { PostRepository } from './../repositories/sequelize/post';

// Imports services
import { PostService } from './../services/post';

// Imports models
import { Post } from './../entities/post';

const router = express.Router();

router.get('/', (req: Request, res: Response, next: () => void) => {

    const host = 'developersworkspace.co.za';
    const username = 'github-blog';
    const password = 'u?a@682P6b#F@Jj8';
    const postRepository = new PostRepository(host, username, password);
    const postService = new PostService(postRepository);

    postService.list().then((posts: Post[]) => {
        res.render('home', {
            user: req.user,
            posts: posts,
            title: 'Home',
            description: 'Cape Town, South Africa based Software Engineer sharing knowledge, experiences and ideas.'
        });
    });
});

router.get('/about', (req: Request, res: Response, next: () => void) => {
    const host = 'developersworkspace.co.za';
    const username = 'github-blog';
    const password = 'u?a@682P6b#F@Jj8';
    const postRepository = new PostRepository(host, username, password);
    const postService = new PostService(postRepository);

    res.render('about', {
        title: 'About',
        description: 'What is Developer\'s Workspace all about? Developer\'s Workspace vision is to create MIT licensed software solution to allow developers to focus on their idea instead of other requirements such as authentication'
    });
});

router.get('/projects', (req: Request, res: Response, next: () => void) => {
    res.render('projects', {
        title: 'Projects',
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.'
    });
});

router.get('/contact', (req: Request, res: Response, next: () => void) => {
    res.render('contact', {
        title: 'Contact',
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.'
    });
});

router.get('/post/:id', (req: Request, res: Response, next: () => void) => {
    const host = 'developersworkspace.co.za';
    const username = 'github-blog';
    const password = 'u?a@682P6b#F@Jj8';
    const postRepository = new PostRepository(host, username, password);
    const postService = new PostService(postRepository);

    postService.find(req.params.id).then((post: Post) => {
        res.render('post', {
            post,
            title: post.title,
            description: post.description
        });
    });
});

router.get('/projects/url-shortener', (req: Request, res: Response, next: () => void) => {
    res.render('./projects/url-shortener', {
        title: 'URL Shortener',
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.'
    });
});

export = router;
