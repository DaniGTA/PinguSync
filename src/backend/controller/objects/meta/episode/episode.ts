import EpisodeTitle from './episode-title';
import { EpisodeType } from './episode-type';
import ExternalProvider from '../../../../api/external-provider';

/**
 * Contains detail infos about a episode.
 */
export default class Episode{
    public readonly season?: number;
    public readonly episodeNumber: number;
    public readonly lastUpdate: number;

    /**
     * -- Optional --
    */

    /**
     * The type of the episode like regular, special etc.
     */
    public type: EpisodeType = EpisodeType.UNKOWN;
    public streamingProviders: ExternalProvider[] = [];
    public summery?: string;
    public title?: EpisodeTitle[];
    public duration?: number;
    public airDate?: Date;
    public lastProviderUpdate?: number;
    public rating?: number;
    public providerEpisodeId?:number |string;

    constructor(episodeNumber: number, season?: number, title?: EpisodeTitle[]) {
        this.season = season;
        this.episodeNumber = episodeNumber;
        this.title = title;
        this.lastUpdate = new Date().getTime();
    }
}