// Imports
import co = require('co');

// Imports models
import { Visitor } from './../entities/visitor';

// Imports interfaces
import { IVisitorRepository } from './../repositories/visitor';

// Import services
import { ShareService } from './share';

export class VisitorService {

    constructor(private visitorRepository: IVisitorRepository) {

    }

    public login(key: string, username: string, type: string): Promise<boolean> {
        const self = this;
        return co(function* () {

            const visitor: Visitor = yield self.visitorRepository.find(key, type);

            if (visitor) {
                yield self.visitorRepository.update(new Visitor(key, username, type, new Date(), new Date()));
            } else {
                yield self.visitorRepository.insert(new Visitor(key, username, type, new Date(), new Date()));
            }

            return true;
        });
    }

    public visit(key: string, username: string, type: string): Promise<boolean> {
        const self = this;
        return co(function* () {

            const visitor: Visitor = yield self.visitorRepository.find(key, type);

            if (visitor) {
                yield self.visitorRepository.update(new Visitor(key, username, type, new Date(), visitor.lastLoginTimestamp));
            } else {
                yield self.visitorRepository.insert(new Visitor(key, username, type, new Date(), new Date()));
            }

            return true;
        });
    }

}
