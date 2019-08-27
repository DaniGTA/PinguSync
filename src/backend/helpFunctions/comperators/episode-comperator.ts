import Series from '../../controller/objects/series';
import ComperatorResult from './comperator-results.ts/comperator-result';

export default class EpisodeComperator{
    static async compareEpisodes(a: Series, b: Series): Promise<ComperatorResult> {
        const result = new ComperatorResult();
        try {
            const allAEpisodes = await a.getAllEpisodes();
            const allBEpisodes = await b.getAllEpisodes();
            // Search if there is a match between the arrays.
            if (allAEpisodes.length != 0 && allBEpisodes.length != 0) {
                result.matchAble += 2;
                if (allAEpisodes.findIndex((valueA) => allBEpisodes.findIndex(valueB => valueB === valueA) != -1) != -1) {
                    result.matches += 2;
                }
            }
        } catch (err) { }
        return result;
    }
}