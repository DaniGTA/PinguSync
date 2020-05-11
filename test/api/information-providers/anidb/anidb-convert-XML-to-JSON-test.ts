import AniDBProvider from '../../../../src/backend/api/information-providers/anidb/anidb-provider';
import AniDBNameListXML from '../../../../src/backend/api/information-providers/anidb/objects/anidbNameListXML';


describe('Provider: AniDB | Convert tests', () => {
    test('xml to json', async () => {
        // tslint:disable-next-line: no-string-literal
        const result: AniDBNameListXML = await new AniDBProvider(false)['getAniDBNameListXML']();
        expect(result.animetitles.anime[0].title[0]._text).toEqual('CotS');
    });
});
