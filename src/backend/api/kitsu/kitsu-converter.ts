import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';
import KitsuProvider from './kitsu-provider';
import { IKitsuEpisode, IKitsuMappings, IMedia } from './objects/searchResult';

import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import Banner from '../../controller/objects/meta/banner';
import Cover from '../../controller/objects/meta/cover';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeThumbnail from '../../controller/objects/meta/episode/episode-thumbnail';
import EpisodeTitle from '../../controller/objects/meta/episode/episode-title';
import { ImageSize } from '../../controller/objects/meta/image-size';
import { MediaType } from '../../controller/objects/meta/media-type';
import { NameType } from '../../controller/objects/meta/name-type';
import { StreamingProviderLocalData } from '../../controller/objects/streaming-provider-local-data';
import AniDBProvider from '../anidb/anidb-provider';
import AniListProvider from '../anilist/anilist-provider';
import MultiProviderResult from '../multi-provider-result';
import TraktProvider from '../trakt/trakt-provider';
import TVDBProvider from '../tvdb/tvdb-provider';

export default new class KitsuConverter {
    public async convertMediaToAnime(media: IMedia, fullInfo: boolean = true): Promise<MultiProviderResult> {
        const providerInfos = new ListProviderLocalData(KitsuProvider.getInstance());
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
        providerInfos.id = media.id;
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
                    const localdata = new InfoProviderLocalData(AniDBProvider.instance.providerName);
                    localdata.id = mapping.externalId;
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'aotora') {
                    const localdata = new InfoProviderLocalData('aotora');
                    localdata.id = mapping.externalId;
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'anilist') {
                    const localdata = new ListProviderLocalData(AniListProvider.getInstance().providerName);
                    const typeId = mapping.externalId.split('/');
                    localdata.id = typeId[1];
                    switch (typeId[0]) {
                        case 'anime':
                            localdata.mediaType = MediaType.ANIME;
                            break;
                    }
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'hulu') {
                    const localdata = new StreamingProviderLocalData('hulu');
                    localdata.id = mapping.externalId;
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'myanimelist/anime') {
                    const localdata = new ListProviderLocalData('mal');
                    localdata.mediaType = MediaType.ANIME;
                    localdata.id = mapping.externalId;
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'myanimelist/manga') {
                    const localdata = new ListProviderLocalData('mal');
                    localdata.id = mapping.externalId;
                    providerLocalData.push(localdata);
                } else if (mapping.externalSite === 'trakt') {
                    const localdata = new ListProviderLocalData(TraktProvider.getInstance().providerName);
                    localdata.id = mapping.externalId;
                    providerLocalData.push(localdata);
                }
            } catch (err) {
                console.log(err);
            }
        }
        try {
            const result = mappings.find((x) => x.externalSite.includes('thetvdb') && x.externalId.includes('/'));
            if (result) {
                const localdata = new InfoProviderLocalData(TVDBProvider.Instance.providerName);
                const idSeason = result.externalId.split('/');
                localdata.id = idSeason[0];
                localdata.targetSeason = Number(idSeason[1]);
                providerLocalData.push(localdata);
            }
        } catch (err) {
            console.log(err);
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
            detailedEpisode.provider = KitsuProvider.getInstance().providerName;
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
