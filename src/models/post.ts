// Imports
import moment = require('moment');

export class Post {

    public displayTimestamp: string = null;

    constructor(public id: string, public title: string, public short: string, public body: string, public author: string, public authorImage: string, public timestamp: string) {
        this.displayTimestamp = moment(this.timestamp).format('DD MMMM YYYY HH:mm')
    }
}