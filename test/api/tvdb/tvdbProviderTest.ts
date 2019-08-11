

import { notStrictEqual } from 'assert';
import TVDBProvider from '../../../src/backend/api/tvdb/tvdbProvider';

describe('TVDB Tests', () => {
    it('should get access key', async () => {
        var x = new TVDBProvider();
        const token = await x['getAccessKey']();
        notStrictEqual(token,"");
        notStrictEqual(token,null);
        notStrictEqual(token,undefined);
        return;
    })

});
