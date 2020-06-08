import ExternalProvider from '../../../../api/provider/external-provider';
import StringHelper from '../../../../helpFunctions/string-helper';
import Season from '../season';
import EpisodeThumbnail from './episode-thumbnail';
import EpisodeTitle from './episode-title';
import { EpisodeType } from './episode-type';
import WatchHistory from './episode-watch-history';

/**
 * Contains detail infos about a episode.
 */
export default class Episode {

    public set season(season: Season | undefined) {
        this._season = season;
    }

    public get season(): Season | undefined {
        if (this._season) {
            return Object.assign(new Season(), this._season);
        }
        return undefined;
    }

    public readonly episodeNumber: number | string;
    public readonly lastUpdate: number;
    public id: string;

    /**
     * -- Optional --
     */

    /**
     * The type of the episode like regular, special etc.
     */
    public type: EpisodeType = EpisodeType.UNKOWN;
    public streamingProviders: ExternalProvider[] = [];
    public summery?: string;
    public title: EpisodeTitle[] = [];
    public duration?: number;
    public airDate?: Date;
    public lastProviderUpdate?: number;
    public rating?: number;
    public provider?: string;
    public providerId?: string | number;
    public providerEpisodeId?: number | string;
    public thumbnails: EpisodeThumbnail[] = [];
    public watchHistory: WatchHistory[] = [];

    private _season?: Season;
    /**
     * Only giv
     * @param episodeNumber
     * @param season season is only needed if its not the same season as the series.
     * @param title
     */
    constructor(episodeNumber: number | string, season?: Season, title?: EpisodeTitle[]) {
        this._season = season;
        this.episodeNumber = episodeNumber;
        if (title) {
            this.title = title;
        }
        this.lastUpdate = new Date().getTime();
        this.id = StringHelper.randomString(20);
    }


    public isEpisodeNumberARealNumber(): boolean {
        return !isNaN(this.episodeNumber as number);
    }
    /**
     * Convert the Episode number to a absolute number
     */
    public getEpNrAsNr(): number {
        return this.episodeNumber as number;
    }
}
