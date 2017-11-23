export interface IWordRepository {

    insert(key: string, word: string, count: number): Promise<boolean>;
    find(word: string): Promise<{}>;
}
