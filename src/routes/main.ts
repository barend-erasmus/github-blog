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
            posts: posts,
        });
    });
});

router.get('/about', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    res.render('about');
});

router.get('/contact', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    res.render('contact');
});

router.get('/post/:id', (req: Request, res: Response, next: () => void) => {
    const postService = new PostService();

    postService.findPost(req.params.id).then((post: any) => {
        res.render('post', {
            post,
        });
    });
});

export = router;
