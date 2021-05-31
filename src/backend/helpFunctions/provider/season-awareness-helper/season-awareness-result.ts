import Season from '../../../controller/objects/meta/season'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import EpisodeRelationAnalyser from '../../episode-helper/episode-relation-analyser'

export default class SeasonAwarenessResult {
    constructor(
        public epResult: EpisodeRelationAnalyser,
        public seasonPart: number | undefined,
        public rightProviderWithAwareness: ProviderLocalData
    ) {}
    /**
     *
     * @returns a confirmed season target
     */
    getSeasonTarget(): Season {
        const season = new Season(this.epResult.finalSeasonNumbers, this.seasonPart)
        season.confirmed = true
        return season
    }
}
