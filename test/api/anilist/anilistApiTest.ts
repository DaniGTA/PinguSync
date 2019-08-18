
import request from 'request';
import assert from 'assert';
import AniListProvider from '../../../src/backend/api/anilist/anilist-provider';


describe('AniListApi Tests', () => {
    it('should return headers', async () => {
        var options: (request.UriOptions & request.CoreOptions) = {
            uri: 'https://graphql.anilist.co',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: "query",
                variables: "variables"
            })
        };

        const a = new AniListProvider();
        const result = a["getGraphQLOptions"]("query", "variables");
        assert.equal(options.body, result.body);
        assert.equal(options.headers + '', result.headers + '');
        assert.equal(options.method, result.method);
        assert.equal(options.uri, result.uri);
        return;
    })
});
