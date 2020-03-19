import { strictEqual } from 'assert';

import { ISimklEpisodeInfo } from '../../../../src/backend/api/information-providers/simkl/objects/simklEpisodeInfo';
import SimklConverter from '../../../../src/backend/api/information-providers/simkl/simkl-converter';
import { EpisodeType } from '../../../../src/backend/controller/objects/meta/episode/episode-type';
import { MediaType } from '../../../../src/backend/controller/objects/meta/media-type';

// tslint:disable: no-string-literal
describe('Provider: Simkl | Converter tests', () => {
    const simklConverterInstance = new SimklConverter();
    const simklEpisode: ISimklEpisodeInfo = { type: 'special', title: 'test', aired: false, img: 'test', ids: { simkl_id: 0 }, description: '', date: 'test' };
    describe('Simkl episode tests', () => {
        describe('Simkl episode type tests', () => {
            test('should convert simkl episode "special" type to SPECIAL', () => {
                simklEpisode.type = 'special';
                const result = simklConverterInstance['convertSimklEpisodeTypeToEpisodeType'](simklEpisode);
                strictEqual(result, EpisodeType.SPECIAL);
            });

            test('should convert simkl episode "episode" type to REGULAR EPISODE', () => {
                simklEpisode.type = 'episode';
                const result = simklConverterInstance['convertSimklEpisodeTypeToEpisodeType'](simklEpisode);
                strictEqual(result, EpisodeType.REGULAR_EPISODE);
            });

            test('should convert simkl episode "unkown" type to UNKNOWN', () => {
                simklEpisode.type = 'unknown';
                const result = simklConverterInstance['convertSimklEpisodeTypeToEpisodeType'](simklEpisode);
                strictEqual(result, EpisodeType.UNKOWN);
            });
        });

        describe('Simkl episode img convert to thumbnail', () => {
            test('should convert img to 3 thumbnails (reason: thumbnail is present)', () => {
                simklEpisode.img = 'x';
                const result = simklConverterInstance['convertSimklEpisodeImgToEpisodeThumbnail'](simklEpisode);
                strictEqual(result.length, 3);
            });

            test('should not convert img to 3 thumbnails (reason: thumbnail is not present)', () => {
                simklEpisode.img = '';
                const result = simklConverterInstance['convertSimklEpisodeImgToEpisodeThumbnail'](simklEpisode);
                strictEqual(result.length, 0);
            });
        });
    });

    describe('Simkl anime tests', () => {
        describe('Anime type tests', () => {
            test('should convert anime media type: tv to ANIME', () => {
                const result = simklConverterInstance['convertAnimeTypeToMediaType']('tv');
                strictEqual(result, MediaType.ANIME);
            });

            test('should convert anime media type: special to SPECIAL', () => {
                const result = simklConverterInstance['convertAnimeTypeToMediaType']('special');
                strictEqual(result, MediaType.SPECIAL);
            });

            test('should convert anime media type: ova to OVA', () => {
                const result = simklConverterInstance['convertAnimeTypeToMediaType']('ova');
                strictEqual(result, MediaType.OVA);
            });

            test('should convert anime media type: movie to MOVIE', () => {
                const result = simklConverterInstance['convertAnimeTypeToMediaType']('movie');
                strictEqual(result, MediaType.MOVIE);
            });

            test('should convert anime media type: unknown to ANIME', () => {
                const result = simklConverterInstance['convertAnimeTypeToMediaType']('asdasd');
                strictEqual(result, MediaType.ANIME);
            });
        });
    });
});
