import { notStrictEqual } from 'assert';
import TVDBProvider from '../../../src/backend/api/tvdb/tvdb-provider';

describe('Provider: TVDB | Test runs', () => {
   test('should get access key', async () => {
        const x = new TVDBProvider();
        // tslint:disable-next-line: no-string-literal
        const token = await x['getAccessKey']();
        notStrictEqual(token, '');
        notStrictEqual(token, null);
        notStrictEqual(token, undefined);
        return;
    });

});
