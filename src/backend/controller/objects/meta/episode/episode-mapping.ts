import ProviderLocalData from '../../../provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import Season from '../season';
import Episode from './episode';

export default class EpisodeMapping {
    public static readonly currentMappingVersion = 1;
    /**
     * The id of the Episode object.
     */
    public readonly id: string;

    public readonly providerSeriesId: number | string;

    public readonly episodeNumber: number | string;

    public readonly provider: string;

    public readonly lastMappingUpdate: number;

    public readonly mappingVersion: number;

    public readonly providerEpisodeId?: number | string;

    public readonly season?: Season;

    constructor(episode: Episode, provider: ProviderLocalData) {
        // Add Episode
        this.episodeNumber = episode.episodeNumber;
        this.id = episode.id;
        this.providerEpisodeId = episode.providerEpisodeId;
        this.season = episode.season;

        // Add Provider
        this.provider = provider.provider;
        this.providerSeriesId = provider.id;

        // Meta data
        this.mappingVersion = EpisodeMapping.currentMappingVersion;
        this.lastMappingUpdate = new Date().getTime();
    }

    public loadPrototypes() {
        if (this.season) {
            Object.setPrototypeOf(this.season, Season.prototype);
        }
    }
}
