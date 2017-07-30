// Imports
import * as co from 'co';
import { BaseRepository } from './base';

// Imports models
import { Post } from './../../entities/post';

export class PostRepository extends BaseRepository {

    constructor(host: string, username: string, password: string) {
        super(host, username, password);
    }

    public insert(post: Post): Promise<boolean> {
        const self = this;
        return co(function*() {
            yield BaseRepository.sequelize.authenticate();

            yield BaseRepository.models.Post.create({
                key: post.key,
                description: post.description,
                author: post.author,
                authorImage: post.authorImage,
                body: post.body,
                linkedInShareCount: post.linkedInShareCount,
                publishedTimestamp: post.publishedTimestamp,
                title: post.title
            });

            return true;
        });
    }

    public find(key: string): Promise<Post> {
        const self = this;
        return co(function*() {

            const post = yield BaseRepository.models.Post.find({
                where: {
                    key,
                },
            });

            if (!post) {
                return null;
            }

            return new Post(post.key, post.title, post.description, post.body, post.author, post.authorImage, post.publishedTimestamp, post.linkedInShareCount);
        });
    }

    public update(post: Post): Promise<boolean> {
        const self = this;
        return co(function*() {

            const existingPost = yield BaseRepository.models.Post.find({
                where: {
                    key: post.key
                },
            });

            if (!existingPost) {
                return false;
            }

            existingPost.author = post.author;
            existingPost.authorImage = post.authorImage;
            existingPost.body = post.body;
            existingPost.description = post.description;
            existingPost.linkedInShareCount = post.linkedInShareCount;
            existingPost.publishedTimestamp = post.publishedTimestamp;
            existingPost.title = post.title;

            yield existingPost.save();

            return true;
        });
    }

    public list(): Promise<Post[]> {
        const self = this;
        return co(function*() {

            const posts = yield BaseRepository.models.Post.findAll({
                order: [
                    ['publishedTimestamp', 'DESC'],
                ],
            });

            return posts.map((x) => new Post(x.key, x.title, x.description, x.body, x.author, x.authorImage, x.publishedTimestamp, x.linkedInShareCount))
        });
    }
}