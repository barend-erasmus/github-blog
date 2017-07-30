// Imports
import moment = require('moment');

export class Post {

    public displayTimestamp: string = null;

    constructor(public key: string,
                public title: string,
                public description: string,
                public body: string,
                public author: string,
                public authorImage: string,
                public publishedTimestamp: string,
                public linkedInShareCount: number) {
        this.displayTimestamp = moment(this.publishedTimestamp).format('DD MMMM YYYY HH:mm');
    }
}
