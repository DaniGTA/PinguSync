import { jsonMember, jsonObject } from 'typedjson';
import ProviderLocalData from '../../../provider-manager/local-data/interfaces/provider-local-data';
import Season from '../season';
import Episode from './episode';

@jsonObject()
export default class EpisodeMapping {
    public static readonly currentMappingVersion = 1;
    /**
     * The id of the episode.
     */
    @jsonMember
    public readonly id: string;
    @jsonMember
    public readonly providerSeriesId: number | string;
    @jsonMember
    public readonly episodeNumber: number | string;
    @jsonMember
    public readonly provider: string;
    @jsonMember
    public readonly lastMappingUpdate: number;
    @jsonMember
    public readonly mappingVersion: number;
    @jsonMember
    public readonly providerEpisodeId?: number | string;
    @jsonMember
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
}
