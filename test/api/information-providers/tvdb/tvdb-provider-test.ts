import TVDBProvider from '../../../../src/backend/api/information-providers/tvdb/tvdb-provider';

describe('Provider: TVDB | Test runs', () => {
    test('should get access key', async () => {
        const x = new TVDBProvider();
        // tslint:disable-next-line: no-string-literal
        await x.waitUntilItCanPerfomNextRequest();
        const token = await x['getAccessKey']();
        expect(token).not.toEqual('');
        expect(token).not.toEqual(null);
        expect(token).not.toEqual(undefined);
        return;
    });

});
