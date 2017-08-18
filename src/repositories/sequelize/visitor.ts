// Imports
import { BaseRepository } from './base';

// Imports models
import { Visitor } from './../../entities/visitor';

export class VisitorRepository extends BaseRepository {

    constructor(host: string, username: string, password: string) {
        super(host, username, password);
    }

    public async insert(visitor: Visitor): Promise<boolean> {
        await BaseRepository.sequelize.authenticate();

        await BaseRepository.models.Visitor.create({
            key: visitor.key,
            lastLoginTimestamp: visitor.lastLoginTimestamp,
            lastVisitTimestamp: visitor.lastVisitTimestamp,
            type: visitor.type,
            username: visitor.username,
        });

        return true;
    }

    public async find(key: string, type: string): Promise<Visitor> {
        await BaseRepository.sequelize.authenticate();

        const visitor: any = await BaseRepository.models.Visitor.find({
            where: {
                key,
                type,
            },
        });

        if (!visitor) {
            return null;
        }

        return new Visitor(visitor.key, visitor.username, visitor.type, visitor.lastVisitTimestamp, visitor.lastLoginTimestamp);
    }

    public async update(visitor: Visitor): Promise<boolean> {
        await BaseRepository.sequelize.authenticate();

        const existingVisitor: any = await BaseRepository.models.Visitor.find({
            where: {
                key: visitor.key,
            },
        });

        if (!existingVisitor) {
            return false;
        }

        existingVisitor.lastLoginTimestamp = visitor.lastLoginTimestamp;
        existingVisitor.lastVisitTimestamp = visitor.lastVisitTimestamp;

        await existingVisitor.save();

        return true;
    }
}
