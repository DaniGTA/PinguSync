
import assert, { strictEqual } from 'assert';
import request from 'request';
import AniListProvider from '../../../src/backend/api/anilist/anilist-provider';
import TestHelper from '../../test-helper';


// tslint:disable: no-string-literal
describe('Provider: AniList | Test runs', () => {
    const anilistProvider = new AniListProvider();
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });
    test('should return headers', async () => {
        const options: (request.UriOptions & request.CoreOptions) = {
            uri: 'https://graphql.anilist.co',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: 'query',
                variables: 'variables',
            }),
        };

        const a = new AniListProvider();
        const result = a['getGraphQLOptions']('query', 'variables');
        assert.equal(options.body, result.body);
        assert.equal(options.headers + '', result.headers + '');
        assert.equal(options.method, result.method);
        assert.equal(options.uri, result.uri);
        return;
    });
});
