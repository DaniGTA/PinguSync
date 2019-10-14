import IExternalProvider from '../../../../api/provider/external-provider';
import stringHelper from '../../../../helpFunctions/string-helper';
import EpisodeMapping from './episode-mapping';
import EpisodeThumbnail from './episode-thumbnail';
import EpisodeTitle from './episode-title';
import { EpisodeType } from './episode-type';

/**
 * Contains detail infos about a episode.
 */
export default class Episode {
    public readonly season?: number;
    public readonly episodeNumber: number;
    public readonly lastUpdate: number;
    public readonly id: string;

    /**
     * -- Optional --
     */

    /**
     * The type of the episode like regular, special etc.
     */
    public type: EpisodeType = EpisodeType.UNKOWN;
    public streamingProviders: IExternalProvider[] = [];
    public summery?: string;
    public title?: EpisodeTitle[];
    public duration?: number;
    public airDate?: Date;
    public lastProviderUpdate?: number;
    public rating?: number;
    public provider?: string;
    public providerEpisodeId?: number | string;
    public mappedTo: EpisodeMapping[] = [];
    public thumbnails: EpisodeThumbnail[] = [];

    /**
     * Only giv
     * @param episodeNumber
     * @param season season is only needed if its not the same season as the series.
     * @param title
     */
    constructor(episodeNumber: number, season?: number, title?: EpisodeTitle[]) {
        this.season = season;
        this.episodeNumber = episodeNumber;
        this.title = title;
        this.lastUpdate = new Date().getTime();
        this.id = stringHelper.randomString(20);
    }

    public async addMapping(episodeMapping: EpisodeMapping) {
        let canBeMapped = true;
        for (const mapping of this.mappedTo) {
            if (mapping.id === episodeMapping.id || episodeMapping.id === this.id) {
                canBeMapped = false;
                break;
            }
        }
        if (canBeMapped) {
            this.mappedTo.push(episodeMapping);
        }
    }
}
