import sortHelper from '../sort-helper';
import listHelper from '../list-helper';
import EpisodeRatedEqualityContainer from './objects/episode-rated-equality-container';

export default class EpisodeRatedEqualityContainerHelper {
    public static async sortingEpisodeRatedEqualityContainerByResultPoints(aEp: EpisodeRatedEqualityContainer, bEp: EpisodeRatedEqualityContainer) {
        const a = aEp.result.matches;
        const b = bEp.result.matches;
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else if (aEp.result.matchAble < bEp.result.matchAble) {
            return -1;
        } else if (aEp.result.matchAble > bEp.result.matchAble) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     *
     * @param re
     * @param numberOfProviders default is 2
     */
    public static async getBestResultsFromEpisodeRatedEqualityContainer(re: EpisodeRatedEqualityContainer[]): Promise<EpisodeRatedEqualityContainer[]> {
        const container: EpisodeRatedEqualityContainer[] = [...re];
        let sorted: EpisodeRatedEqualityContainer[] = await sortHelper.quickSort(container, async (a, b) => EpisodeRatedEqualityContainerHelper.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
        const results: EpisodeRatedEqualityContainer[] = [];
        while (sorted.length !== 0) {
            const bestResult = sorted[0];
            results.push(bestResult);
            sorted = listHelper.removeEntrys(sorted, ...this.getAllRatingsThatAreRelatedToRating(bestResult, sorted));
        }
        if (results.length !== 0) {
            return results;
        }
        throw new Error('no results in rated equality container');
    }

    private static getAllRatingsThatAreRelatedToRating(targetRating: EpisodeRatedEqualityContainer, allRating: EpisodeRatedEqualityContainer[] | readonly EpisodeRatedEqualityContainer[]): EpisodeRatedEqualityContainer[] {
        const result: EpisodeRatedEqualityContainer[] = [];
        for (const rating of allRating) {
            for (const bindingA of rating.episodeBinds) {
                for (const bindingB of targetRating.episodeBinds) {
                    if (bindingA.provider.provider === bindingB.provider.provider && bindingA.episode.id === bindingB.episode.id) {
                        result.push(rating);
                    }
                }
            }
        }
        return result;
    }
}
