import { MediaType } from '../../controller/objects/meta/media-type';
import Series from '../../controller/objects/series';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';

export default class MediaTypeComperator {
    public static async compareMediaTypeWithSeries(a: Series, b: Series): Promise<ComperatorResult> {
        const aMediaType = await a.getMediaType();
        const bMediaType = await b.getMediaType();
        return this.comperaMediaType(aMediaType, bMediaType);
    }

    public static async comperaMediaType(aMediaType: MediaType, bMediaType: MediaType): Promise<ComperatorResult> {
        const comperatorResult = new ComperatorResult();
        if (aMediaType !== MediaType.UNKOWN && bMediaType !== MediaType.UNKOWN) {
            if ((aMediaType === MediaType.ANIME && bMediaType === MediaType.SERIES) || (bMediaType === MediaType.ANIME && aMediaType === MediaType.SERIES)) {
                comperatorResult.matchAble += 2;
            } else {
                comperatorResult.matchAble += 4;
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
}
