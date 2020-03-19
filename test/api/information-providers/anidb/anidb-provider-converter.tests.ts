import { strictEqual } from 'assert';
import AniDBConverter from '../../../src/backend/api/anidb/anidb-converter';
import { EpisodeElement } from '../../../src/backend/api/anidb/objects/anidbFullInfoXML';
import { EpisodeType } from '../../../src/backend/controller/objects/meta/episode/episode-type';

// tslint:disable: no-string-literal
describe('Provider: AniDB | Converter tests', () => {
    const anidbConverter = new AniDBConverter();
    describe('episode converter', () => {
        describe('episode type converter', () => {
            test('should convert episode type 1 to REGULAR_EPISODE', () => {
                // tslint:disable-next-line: no-object-literal-type-assertion
                const episodeElement: EpisodeElement = { epno: { _attributes: { type: '1' } } } as EpisodeElement;

                const result = anidbConverter['getEpisodeType'](episodeElement);
                strictEqual(result, EpisodeType.REGULAR_EPISODE);
            });

            test('should convert episode type 2 to OPENING_OR_ENDING', () => {
                // tslint:disable-next-line: no-object-literal-type-assertion
                const episodeElement: EpisodeElement = { epno: { _attributes: { type: '2' } } } as EpisodeElement;

                const result = anidbConverter['getEpisodeType'](episodeElement);
                strictEqual(result, EpisodeType.OPENING_OR_ENDING);
            });

            test('should convert episode type 3 to OTHER', () => {
                // tslint:disable-next-line: no-object-literal-type-assertion
                const episodeElement: EpisodeElement = { epno: { _attributes: { type: '3' } } } as EpisodeElement;

                const result = anidbConverter['getEpisodeType'](episodeElement);
                strictEqual(result, EpisodeType.OTHER);
            });

            test('should convert episode type others to UNKOWN', () => {
                // tslint:disable-next-line: no-object-literal-type-assertion
                const episodeElement: EpisodeElement = { epno: { _attributes: { type: '4' } } } as EpisodeElement;

                const result = anidbConverter['getEpisodeType'](episodeElement);
                strictEqual(result, EpisodeType.UNKOWN);
            });
        });
    });
});
