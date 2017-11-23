// Imports
import { BaseRepository } from './base';

// Imports models
import { Post } from './../../entities/post';

export class WordRepository extends BaseRepository {

    constructor(host: string, username: string, password: string) {
        super(host, username, password);
    }

    public async insert(key: string, word: string, count: number): Promise<boolean> {
        const post: any = await BaseRepository.models.Post.find({
            where: {
                key,
            },
        });

        if (!post) {
            return false;
        }

        await BaseRepository.models.Word.create({
            count,
            postId: post.id,
            text: word,
        });

        return true;
    }

    public async find(word: string): Promise<{}> {

        const words: any[] = await BaseRepository.models.Word.findAll({
            include: [
                { model: BaseRepository.models.Post },
            ],
            order: [
                ['count', 'DESC'],
            ],
            where: {
                text: word,
            },
        });

        const result: {} = {};

        for (const item of words) {
           result[item.post.key] = item.count;
       }

        return result;
    }
}
