import AniDBNameListXML from '../../../src/backend/api/anidb/objects/anidbNameListXML';
import { deepEqual } from 'assert';
import AniDBNameProvider from '../../../src/backend/api/anidb/anidbNameProvider';

describe('AniDB Tests | convert', () => {
    it('xml to json', async () => {
        const result: AniDBNameListXML = await new AniDBNameProvider()['getAniDBNameListXML']();
        deepEqual(result.animetitles.anime[0].title[0]._text, "CotS");
    })
});
