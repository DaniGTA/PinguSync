
import request from 'request';
import assert, { strictEqual } from 'assert';
import AniListProvider from '../../../src/backend/api/anilist/anilist-provider';
import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';


describe('AniListApi Tests', () => {
    const anilistProvider = new AniListProvider();

    
    before(() => {
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => { return [] };
        MainListLoader['saveData'] = async () => { };
    })
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
    });
    it('should get a series (1/1)', async () => {

    })
    
});
