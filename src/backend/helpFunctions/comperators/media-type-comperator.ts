import { MediaType } from '../../controller/objects/meta/media-type';
import Series from '../../controller/objects/series';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';

export default class MediaTypeComperator {
    public static async compareMediaTypeWithSeries(a: Series, b: Series): Promise<ComperatorResult> {
        const [aMediaType, bMediaType] = await Promise.all([a.getMediaType(), b.getMediaType()]);
        return this.comperaMediaType(aMediaType, bMediaType);
    }

    public static comperaMediaType(aMediaType: MediaType, bMediaType: MediaType): ComperatorResult {
        const comperatorResult = new ComperatorResult();
        if (aMediaType !== MediaType.UNKOWN && bMediaType !== MediaType.UNKOWN) {
             comperatorResult.matchAble += 4;
             if (aMediaType === bMediaType) {
                comperatorResult.matches += 4;
            } else if (MediaTypeComperator.areTheseMediaTypeBothNormalSeries(aMediaType, bMediaType)) {
                comperatorResult.matches += 2;
            } else {
                if (aMediaType === bMediaType) {
                    comperatorResult.matches += 4;
                } else {
                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
                }
            }
        } else if (aMediaType === MediaType.SPECIAL || bMediaType === MediaType.SPECIAL) {
            comperatorResult.matchAble += 1;
        }
        return comperatorResult;
    }

    public static isMediaTypeANormalSeries(mediaType: MediaType): boolean {
        if (mediaType === MediaType.UNKOWN_SERIES) {
            return true;
        } else if (mediaType === MediaType.SERIES) {
            return true;
        } else if (mediaType === MediaType.ANIME) {
            return true;
        }
        return false;
    }

    public static areTheseMediaTypeBothNormalSeries(a: MediaType, b: MediaType): boolean {
        return this.isMediaTypeANormalSeries(a) === this.isMediaTypeANormalSeries(b);
    }
}
