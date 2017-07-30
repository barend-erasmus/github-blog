// Imports models
import { Post } from './../entities/post';

export interface IPostRepository {

    insert(post: Post): Promise<boolean>;
    find(key: string): Promise<Post>;
    update(post: Post): Promise<boolean>;
    list(): Promise<Post[]>;
}