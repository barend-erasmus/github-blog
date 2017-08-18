// Imports models
import { Visitor } from './../entities/visitor';

// Imports interfaces
import { IVisitorRepository } from './../repositories/visitor';

// Import services
import { ShareService } from './share';

export class VisitorService {

    constructor(private visitorRepository: IVisitorRepository) {

    }

    public async login(key: string, username: string, type: string): Promise<boolean> {
        const visitor: Visitor = await this.visitorRepository.find(key, type);

        if (visitor) {
            await this.visitorRepository.update(new Visitor(key, username, type, new Date(), new Date()));
        } else {
            await this.visitorRepository.insert(new Visitor(key, username, type, new Date(), new Date()));
        }

        return true;
    }

    public async visit(key: string, username: string, type: string): Promise<boolean> {
        const visitor: Visitor = await this.visitorRepository.find(key, type);

        if (visitor) {
            await this.visitorRepository.update(new Visitor(key, username, type, new Date(), visitor.lastLoginTimestamp));
        } else {
            await this.visitorRepository.insert(new Visitor(key, username, type, new Date(), new Date()));
        }

        return true;
    }

}
