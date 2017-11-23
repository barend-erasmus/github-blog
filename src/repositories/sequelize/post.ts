// Imports
import { BaseRepository } from './base';

// Imports models
import { Post } from './../../entities/post';

export class PostRepository extends BaseRepository {

    constructor(host: string, username: string, password: string) {
        super(host, username, password);
    }

    public async insert(post: Post): Promise<boolean> {
        await BaseRepository.models.Post.create({
            author: post.author,
            authorImage: post.authorImage,
            body: post.body,
            category: post.category,
            description: post.description,
            image: post.image,
            key: post.key,
            linkedInShareCount: post.linkedInShareCount,
            publishedTimestamp: post.publishedTimestamp,
            title: post.title,
        });

        return true;
    }

    public async find(key: string): Promise<Post> {
        const post: any = await BaseRepository.models.Post.find({
            where: {
                key,
            },
        });

        if (!post) {
            return null;
        }

        return new Post(post.key, post.title, post.description, post.body, post.image, post.category, post.author, post.authorImage, post.publishedTimestamp, post.linkedInShareCount);
    }

    public async update(post: Post): Promise<boolean> {
        const existingPost: any = await BaseRepository.models.Post.find({
            where: {
                key: post.key,
            },
        });

        if (!existingPost) {
            return false;
        }

        existingPost.author = post.author;
        existingPost.authorImage = post.authorImage;
        existingPost.body = post.body;
        existingPost.category = post.category;
        existingPost.image = post.image;
        existingPost.description = post.description;
        existingPost.linkedInShareCount = post.linkedInShareCount;
        existingPost.publishedTimestamp = post.publishedTimestamp;
        existingPost.title = post.title;

        await existingPost.save();

        return true;
    }

    public async list(): Promise<Post[]> {

        const posts: any[] = await BaseRepository.models.Post.findAll({
            order: [
                ['publishedTimestamp', 'DESC'],
            ],
        });

        return posts.map((x) => new Post(x.key, x.title, x.description, x.body, x.image, x.category, x.author, x.authorImage, x.publishedTimestamp, x.linkedInShareCount));
    }
}
