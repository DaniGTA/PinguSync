import AniDBNameListXML from '../../../src/backend/api/anidb/objects/anidbNameListXML';
import { deepEqual } from 'assert';
import AniDBNameList from '../../../src/backend/api/anidb/anidbNameList';

describe('AniDB Tests | convert', () => {
    it('xml to json', async () => {
        const result: AniDBNameListXML = await new AniDBNameList()['getAniDBNameListXML']();
        if (Array.isArray(result.animetitles.anime[0].title)) {
            deepEqual(result.animetitles.anime[0].title[0]._text, "CotS");
        } else {
            deepEqual(result.animetitles.anime[0].title._text, "CotS");
        }
    })
});
