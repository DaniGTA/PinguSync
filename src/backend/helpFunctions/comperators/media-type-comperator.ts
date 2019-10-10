import { MediaType } from '../../controller/objects/meta/media-type';
import Series from '../../controller/objects/series';
import ComperatorResult from './comperator-results.ts/comperator-result';

export default class MediaTypeComperator {
    public static async compareMediaType(a: Series, b: Series): Promise<ComperatorResult> {
        const comperatorResult = new ComperatorResult();
        const aMediaType = await a.getMediaType();
        const bMediaType = await b.getMediaType();
        if (aMediaType !== MediaType.UNKOWN && bMediaType !== MediaType.UNKOWN) {
            if ((aMediaType === MediaType.ANIME && bMediaType === MediaType.SERIES) || (bMediaType === MediaType.ANIME && aMediaType === MediaType.SERIES)) {
                comperatorResult.matchAble += 2;
            } else {
                comperatorResult.matchAble += 4;
                if (aMediaType === bMediaType) {
                    comperatorResult.matches += 4;
                }
            }
        } else if (aMediaType === MediaType.SPECIAL || bMediaType === MediaType.SPECIAL) {
            comperatorResult.matchAble += 1;
        }
        return comperatorResult;
    }
}
