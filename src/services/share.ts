// Imports
import * as rp from 'request-promise';

export class ShareService {

    public async linkedIn(url: string): Promise<number> {
        const result = await rp({
            json: true,
            method: 'GET',
            uri: `https://www.linkedin.com/countserv/count/share?format=json&url=${url}`,
        });

        return result.count;
    }
}
