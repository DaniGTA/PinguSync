import { deepEqual } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';
import AniDBNameListXML from '../../../src/backend/api/anidb/objects/anidbNameListXML';

describe('Provider: AniDB | Convert tests', () => {
   it('xml to json', async () => {
        // tslint:disable-next-line: no-string-literal
        const result: AniDBNameListXML = await new AniDBProvider(false)['getAniDBNameListXML']();
        deepEqual(result.animetitles.anime[0].title[0]._text, 'CotS');
    });
});
