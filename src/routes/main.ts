// Imports
import { Express, Request, Response } from "express";
import * as express from 'express';
import * as request from 'request';
import { config } from './../config';

// Imports repositories

// Imports services

const router = express.Router();

router.get('/', (req: Request, res: Response, next: () => void) => {
    res.render('home');
});

export = router;
