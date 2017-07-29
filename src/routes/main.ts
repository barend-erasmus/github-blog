// Imports
import { Express, Request, Response } from "express";
import * as express from 'express';
import * as request from 'request';
import { config } from './../config';

// Imports repositories

// Imports services
import { PostService } from './../services/post';

// Imports models
import { Post } from './../models/post';

const router = express.Router();

router.get('/', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    postService.listPosts().then((posts: Post[]) => {
        res.render('home', {
            user: req.user,
            posts: posts,
            title: 'Home',
            description: 'Cape Town, South Africa based Software Engineer sharing knowledge, experiences and ideas.'
        });
    });
});

router.get('/about', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    res.render('about', {
        title: 'About',
        description: 'What is Developer\'s Workspace all about? Developer\'s Workspace vision is to create MIT licensed software solution to allow developers to focus on their idea instead of other requirements such as authentication'
    });
});

router.get('/projects', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    res.render('projects', {
        title: 'Projects',
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.'
    });
});

router.get('/contact', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    res.render('contact', {
        title: 'Contact',
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.'
    });
});

router.get('/post/:id', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    postService.findPost(req.params.id).then((post: Post) => {
        res.render('post', {
            post,
            title: post.title,
            description: post.short
        });
    });
});

router.get('/projects/url-shortener', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    res.render('./projects/url-shortener', {
        title: 'URL Shortener',
        description: 'Developer\'s Workspace is always open to ideas, support and solutions. Feel free to contact us at any time.'
    });
});

export = router;
