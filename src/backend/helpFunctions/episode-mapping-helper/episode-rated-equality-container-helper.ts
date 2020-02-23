import EpisodeRatedEqualityContainer from './episode-rated-equality-container';

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
}
