import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import KitsuProvider from './kitsu-provider';
import { IKitsuEpisode, IKitsuMappings, IMedia } from './objects/searchResult';

import Banner from '../../controller/objects/meta/banner';
import Cover from '../../controller/objects/meta/cover';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeThumbnail from '../../controller/objects/meta/episode/episode-thumbnail';
import EpisodeTitle from '../../controller/objects/meta/episode/episode-title';
import { ImageSize } from '../../controller/objects/meta/image-size';
import { MediaType } from '../../controller/objects/meta/media-type';
import { NameType } from '../../controller/objects/meta/name-type';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import { StreamingProviderLocalData } from '../../controller/provider-manager/local-data/streaming-provider-local-data';
import logger from '../../logger/logger';
import AniDBProvider from '../anidb/anidb-provider';
import AniListProvider from '../anilist/anilist-provider';
import MalProvider from '../mal/mal-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import TraktProvider from '../trakt/trakt-provider';
import TVDBProvider from '../tvdb/tvdb-provider';
import ProviderNameManager from '../../controller/provider-manager/provider-name-manager';

export default new class KitsuConverter {
    public async convertMediaToAnime(media: IMedia, fullInfo: boolean = true): Promise<MultiProviderResult> {
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
        } catch (err) { }

        try {
            providerInfos.banners.push(new Banner(media.coverImage.original, ImageSize.ORIGINAL));
            providerInfos.banners.push(new Banner(media.coverImage.tiny, ImageSize.TINY));
            providerInfos.banners.push(new Banner(media.coverImage.small, ImageSize.SMALL));
            providerInfos.banners.push(new Banner(media.coverImage.large, ImageSize.LARGE));
        } catch (err) { }


        providerInfos.hasFullInfo = fullInfo;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;

        providerInfos.lastExternalChange = new Date(media.updatedAt);
        if (media.episodes) {
            providerInfos.detailEpisodeInfo.push(...await this.convertKitsuEpisodesToEpisodes(media.episodes));
        }

        const mpr = new MultiProviderResult(providerInfos);
        if (media.mappings) {
            const providers = await this.convertKitsuMappingsToProvider(media.mappings);
            mpr.subProviders.push(...providers);
        }
        return mpr;
    }

    public async convertKitsuMappingsToProvider(mappings: IKitsuMappings[]): Promise<ProviderLocalData[]> {
        const providerLocalData: ProviderLocalData[] = [];
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
                    const id = typeId[1];
                    let mediaType = MediaType.UNKOWN;
                    switch (typeId[0]) {
                        case 'anime':
                            mediaType = MediaType.ANIME;
                            break;
                        default:
                            logger.warn('[KitsuConverter] Missing MediaType: ' + mediaType);
                            break;
                    }
                    const localdata = new ListProviderLocalData(id, AniListProvider);
                    localdata.mediaType = mediaType;
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'hulu') {
                    const localdata = new StreamingProviderLocalData(mapping.externalId, 'hulu');
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'myanimelist/anime') {
                    const localdata = new ListProviderLocalData(mapping.externalId, MalProvider);
                    localdata.mediaType = MediaType.ANIME;
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
                const localdata = new InfoProviderLocalData(idSeason[0], TVDBProvider);
                localdata.targetSeason = Number(idSeason[1]);
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
                for (const title of episode.titles) {
                    if (title.en_jp) {
                        episodeTitles.push(new EpisodeTitle(title.en_jp, 'en_jp'));
                    } else if (title.en_us) {
                        episodeTitles.push(new EpisodeTitle(title.en_us, 'en_us'));
                    } else if (title.ja_jp) {
                        episodeTitles.push(new EpisodeTitle(title.ja_jp, 'jap'));
                    }

                }
            }
            const episodeThumbnails = [];
            if (episode.thumbnail) {
                for (const thumbnail of episode.thumbnail) {
                    if (thumbnail.original) {
                        episodeThumbnails.push(new EpisodeThumbnail(thumbnail.original, ImageSize.ORIGINAL));
                    }
                }
            }

            const detailedEpisode = new Episode(episode.number, episode.seasonNumber, episodeTitles);
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
