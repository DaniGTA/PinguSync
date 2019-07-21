import * as assert from 'assert';
import AniListProvider from '../../../src/backend/api/anilist/aniListProvider';
import request from 'request';


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
        assert.equal(options, a["getGraphQLOptions"]("query", "variables"));

        return;
    })

});
