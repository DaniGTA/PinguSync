import AniDBNameListXML from '../../../src/backend/api/anidb/objects/anidbNameListXML';
import { deepEqual } from 'assert';
import  AniDBProvider  from '../../../src/backend/api/anidb/anidb-provider';

describe('AniDB Tests | convert', () => {
    it('xml to json', async () => {
        const result: AniDBNameListXML = await new AniDBProvider()['getAniDBNameListXML']();
        deepEqual(result.animetitles.anime[0].title[0]._text, "CotS");
    })
});
