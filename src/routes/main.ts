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
            description: 'Cape Town, South Africa based Software Engineer sharing knowledge, experiences and ideas.',
            posts,
            title: 'Home',
            user: req.user,
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
        description: 'What is Developer\'s Workspace all about? Developer\'s Workspace vision is to create MIT licensed software solution to allow developers to focus on their idea instead of other requirements such as authentication',
        title: 'About',
    });
});

router.get('/contact', (req: Request, res: Response, next: () => void) => {
    res.render('contact', {
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.',
        title: 'Contact',
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
            description: post.description,
            post,
            title: post.title,
        });
    });
});

export = router;
