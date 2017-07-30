// Imports models
import { Visitor } from './../entities/visitor';

export interface IVisitorRepository {
    insert(visitor: Visitor): Promise<boolean>;
    find(key: string, type: string): Promise<Visitor>;
    update(visitor: Visitor): Promise<boolean>;
}
