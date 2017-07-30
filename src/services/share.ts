// Imports
import co = require('co');
import rp = require('request-promise');

export class ShareService {

    public linkedIn(url: string): Promise<number> {
        return co(function* () {

            const result = yield rp({
                json: true,
                method: 'GET',
                uri: `https://www.linkedin.com/countserv/count/share?format=json&url=${url}`,
            });

            return result.count;
        });
    }
}
