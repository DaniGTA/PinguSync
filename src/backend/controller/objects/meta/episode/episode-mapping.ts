import Episode from './episode';
import ProviderLocalData from '../../../provider-manager/local-data/interfaces/provider-local-data';
import Season from '../season';

export default class EpisodeMapping {
    public static readonly currentMappingVersion = 1;

    public readonly id: string;
    public readonly providerSeriesId: number | string;
    public readonly episodeNumber: number | string;
    public readonly season?: Season;
    public readonly provider: string;
    public readonly lastMappingUpdate: number;
    public readonly mappingVersion: number;

    constructor(episode: Episode, provider: ProviderLocalData) {
        this.id = episode.id;
        this.episodeNumber = episode.episodeNumber;
        this.season = episode.season;
        this.provider = provider.provider;
        this.lastMappingUpdate = new Date().getTime();
        this.mappingVersion = EpisodeMapping.currentMappingVersion;
        this.providerSeriesId = provider.id;
    }

}
