// Imports
import * as co from 'co';
import { BaseRepository } from './base';

// Imports models
import { Visitor } from './../../entities/visitor';

export class VisitorRepository extends BaseRepository {

    constructor(host: string, username: string, password: string) {
        super(host, username, password);
    }

    public insert(visitor: Visitor): Promise<boolean> {
        const self = this;
        return co(function* () {
            yield BaseRepository.sequelize.authenticate();

            yield BaseRepository.models.Visitor.create({
                key: visitor.key,
                lastLoginTimestamp: visitor.lastLoginTimestamp,
                lastVisitTimestamp: visitor.lastVisitTimestamp,
                type: visitor.type,
                username: visitor.username,
            });

            return true;
        });
    }

    public find(key: string, type: string): Promise<Visitor> {
        const self = this;
        return co(function* () {
            yield BaseRepository.sequelize.authenticate();

            const visitor = yield BaseRepository.models.Visitor.find({
                where: {
                    key,
                    type,
                },
            });

            if (!visitor) {
                return null;
            }

            return new Visitor(visitor.key, visitor.username, visitor.type, visitor.lastVisitTimestamp, visitor.lastLoginTimestamp);
        });
    }

    public update(visitor: Visitor): Promise<boolean> {
        const self = this;
        return co(function* () {
            yield BaseRepository.sequelize.authenticate();

            const existingVisitor = yield BaseRepository.models.Visitor.find({
                where: {
                    key: visitor.key,
                },
            });

            if (!existingVisitor) {
                return false;
            }

            existingVisitor.lastLoginTimestamp = visitor.lastLoginTimestamp;
            existingVisitor.lastVisitTimestamp = visitor.lastVisitTimestamp;

            yield existingVisitor.save();

            return true;
        });
    }
}
