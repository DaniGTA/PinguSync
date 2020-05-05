import { isArray } from 'util';
import Banner from '../../../controller/objects/meta/banner';
import Cover from '../../../controller/objects/meta/cover';
import Episode from '../../../controller/objects/meta/episode/episode';
import EpisodeThumbnail from '../../../controller/objects/meta/episode/episode-thumbnail';
import EpisodeTitle from '../../../controller/objects/meta/episode/episode-title';
import { ImageSize } from '../../../controller/objects/meta/image-size';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import { NameType } from '../../../controller/objects/meta/name-type';
import Overview from '../../../controller/objects/meta/overview';
import Season from '../../../controller/objects/meta/season';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import { StreamingProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/streaming-provider-local-data';
import ProviderNameManager from '../../../controller/provider-controller/provider-manager/provider-name-manager';
import ProviderLocalDataWithSeasonInfo from '../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import logger from '../../../logger/logger';
import MultiProviderResult from '../../provider/multi-provider-result';
import AniDBProvider from '../anidb/anidb-provider';
import AniListProvider from '../anilist/anilist-provider';
import MalProvider from '../mal/mal-provider';
import TraktProvider from '../trakt/trakt-provider';
import TVDBProvider from '../tvdb/tvdb-provider';
import KitsuProvider from './kitsu-provider';
import { IKitsuEpisode, IKitsuEpisodeTitle, IKitsuMappings, IMedia } from './objects/searchResult';

export default new class KitsuConverter {
    public async convertMediaToAnime(media: IMedia, fullInfo: ProviderInfoStatus = ProviderInfoStatus.FULL_INFO): Promise<MultiProviderResult> {
        logger.debug('[KitsuConverter] Starting converting media to provider local data. MediaInfo: ID: ' + media.id + ' TYPE:' + media.type);
        const providerInfos = new ListProviderLocalData(media.id, KitsuProvider.getInstance());
        if (media.titles.en) {
            providerInfos.addSeriesName(new Name(media.titles.en, 'en'));
        }
        if (media.titles.en_us) {
            providerInfos.addSeriesName(new Name(media.titles.en_us, 'en_us', NameType.OFFICIAL));
        }
        if (media.titles.ja_jp) {
            providerInfos.addSeriesName(new Name(media.titles.ja_jp, 'jap'));
        }
        if (media.slug) {
            providerInfos.addSeriesName(new Name(media.slug, 'slug', NameType.SLUG));
        }
        if (media.titles.en_us) {
            providerInfos.addSeriesName(new Name(media.titles.en_us, 'en_us'));
        }
        providerInfos.addSeriesName(new Name(media.canonicalTitle, 'canonicalTitle'));

        providerInfos.addOverview(new Overview(media.synopsis, 'eng'));
        if (media.startDate) {
            providerInfos.releaseYear = new Date(media.startDate).getFullYear();
        }
        providerInfos.runTime = media.episodeLength;

        providerInfos.mediaType = this.convertShowTypeToMediaType(media.showType);
        try {
            providerInfos.covers.push(new Cover(media.posterImage.original, ImageSize.ORIGINAL));
            providerInfos.covers.push(new Cover(media.posterImage.tiny, ImageSize.TINY));
            providerInfos.covers.push(new Cover(media.posterImage.small, ImageSize.SMALL));
            providerInfos.covers.push(new Cover(media.posterImage.large, ImageSize.LARGE));
        } catch (err) {
            logger.debug(err);
        }

        try {
            providerInfos.banners.push(new Banner(media.coverImage.original, ImageSize.ORIGINAL));
            providerInfos.banners.push(new Banner(media.coverImage.tiny, ImageSize.TINY));
            providerInfos.banners.push(new Banner(media.coverImage.small, ImageSize.SMALL));
            providerInfos.banners.push(new Banner(media.coverImage.large, ImageSize.LARGE));
        } catch (err) {
            logger.debug(err);
        }


        providerInfos.infoStatus = fullInfo;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;

        providerInfos.lastExternalChange = new Date(media.updatedAt);
        if (media.episodes) {
            providerInfos.addDetailedEpisodeInfos(...await this.convertKitsuEpisodesToEpisodes(media.episodes));
        }
        let providers: Array<ProviderLocalData | ProviderLocalDataWithSeasonInfo> = [];
        if (media.mappings) {
            providers = await this.convertKitsuMappingsToProvider(media.mappings);
        }

        const mpr = new MultiProviderResult(providerInfos, ...providers);
        return mpr;
    }

    public async convertKitsuMappingsToProvider(mappings: IKitsuMappings[]): Promise<Array<ProviderLocalData | ProviderLocalDataWithSeasonInfo>> {
        const providerLocalData: Array<ProviderLocalData | ProviderLocalDataWithSeasonInfo> = [];
        for (const mapping of mappings) {
            try {
                if (mapping.externalSite === 'anidb') {
                    const localdata = new InfoProviderLocalData(mapping.externalId, AniDBProvider.instance);
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'aotora') {
                    const localdata = new InfoProviderLocalData(mapping.externalId, 'aotora');
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'anilist') {
                    const typeId = mapping.externalId.split('/');
                    let id = typeId[0];
                    if (typeId.length !== 1) {
                        id = typeId[1];
                    }
                    const localdata = new ListProviderLocalData(id, AniListProvider);
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'hulu') {
                    const localdata = new StreamingProviderLocalData(mapping.externalId, 'hulu');
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'myanimelist/anime') {
                    const localdata = new ListProviderLocalData(mapping.externalId, MalProvider);
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'myanimelist/manga') {
                    const localdata = new ListProviderLocalData(mapping.externalId, MalProvider);
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'trakt') {
                    const localdata = new ListProviderLocalData(mapping.externalId, TraktProvider);
                    providerLocalData.push(localdata);
                }
            } catch (err) {
                logger.log('info', err);
            }
        }
        try {
            const result = mappings.find((x) => x.externalSite.includes('thetvdb') && x.externalId.includes('/'));
            if (result) {
                const idSeason = result.externalId.split('/');
                const seasonnumber = Number(idSeason[1]);
                const localdata = new ProviderLocalDataWithSeasonInfo(new InfoProviderLocalData(idSeason[0], TVDBProvider), new Season(seasonnumber));
                providerLocalData.push(localdata);
            }
        } catch (err) {
            logger.log('info', err);
        }
        return providerLocalData;
    }

    public async convertKitsuEpisodesToEpisodes(episodes: IKitsuEpisode[]): Promise<Episode[]> {
        const detailedEpisodes: Episode[] = [];

        for (const episode of episodes) {
            const episodeTitles = [];
            if (episode.titles) {
                if (isArray(episode.titles)) {
                    for (const title of episode.titles) {
                        if (title.en_jp) {
                            episodeTitles.push(new EpisodeTitle(title.en_jp, 'en_jp'));
                        } else if (title.en_us) {
                            episodeTitles.push(new EpisodeTitle(title.en_us, 'en_us'));
                        } else if (title.ja_jp) {
                            episodeTitles.push(new EpisodeTitle(title.ja_jp, 'jap'));
                        }
                    }
                } else {
                    const title = episode.titles;
                    if (title.en_jp) {
                        episodeTitles.push(new EpisodeTitle(title.en_jp, 'en_jp'));
                    }
                    if (title.en_us) {
                        episodeTitles.push(new EpisodeTitle(title.en_us, 'en_us'));
                    }
                    if (title.ja_jp) {
                        episodeTitles.push(new EpisodeTitle(title.ja_jp, 'jap'));
                    }
                }
            }
            const episodeThumbnails = [];
            if (episode.thumbnail) {
                if (Array.isArray(episode.thumbnail)) {
                    for (const thumbnail of episode.thumbnail) {
                        if (thumbnail.original) {
                            episodeThumbnails.push(new EpisodeThumbnail(thumbnail.original, ImageSize.ORIGINAL));
                        }
                    }
                } else {
                    episodeThumbnails.push(new EpisodeThumbnail((episode as any).thumbnail.original, ImageSize.ORIGINAL));

                }
            }

            const detailedEpisode = new Episode(episode.number, undefined, episodeTitles);
            detailedEpisode.airDate = new Date(episode.airdate);
            detailedEpisode.duration = episode.length;
            detailedEpisode.lastProviderUpdate = new Date(episode.updatedAt).getTime();
            detailedEpisode.providerEpisodeId = episode.id;
            detailedEpisode.provider = ProviderNameManager.getProviderName(KitsuProvider);
            detailedEpisode.summery = episode.synopsis;
            detailedEpisode.thumbnails.push(...episodeThumbnails);
            detailedEpisodes.push(detailedEpisode);
        }

        return detailedEpisodes;
    }

    public convertShowTypeToMediaType(showType: string): MediaType {
        if (showType === 'ONA') {
            return MediaType.SPECIAL;
        } else if (showType === 'OVA') {
            return MediaType.SPECIAL;
        } else if (showType === 'TV') {
            return MediaType.ANIME;
        } else if (showType === 'movie') {
            return MediaType.MOVIE;
        } else if (showType === 'music') {
            return MediaType.SPECIAL;
        } else if (showType === 'special') {
            return MediaType.SPECIAL;
        }
        return MediaType.UNKOWN;
    }
}();
