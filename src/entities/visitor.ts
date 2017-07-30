// Imports
import moment = require('moment');

export class Visitor {

    public displayTimestamp: string = null;

    constructor(public key: string,
                public username: string,
                public type: string,
                public lastVisitTimestamp: Date,
                public lastLoginTimestamp: Date) {
    }
}
