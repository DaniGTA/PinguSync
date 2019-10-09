import { Media, KitsuEpisode, KitsuMappings } from './objects/searchResult';
import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import KitsuProvider from './kitsu-provider';

import Cover from '../../controller/objects/meta/cover';
import { NameType } from '../../controller/objects/meta/name-type';
import { MediaType } from '../../controller/objects/meta/media-type';
import Banner from '../../controller/objects/meta/banner';
import { ImageSize } from '../../controller/objects/meta/image-size';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeTitle from '../../controller/objects/meta/episode/episode-title';
import EpisodeThumbnail from '../../controller/objects/meta/episode/episode-thumbnail';
import MultiProviderResult from '../multi-provider-result';
import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import AniDBProvider from '../anidb/anidb-provider';
import AniListProvider from '../anilist/anilist-provider';
import { StreamingProviderLocalData } from '../../controller/objects/streaming-provider-local-data';
import TVDBProvider from '../tvdb/tvdb-provider';

export default new class KitsuConverter {
    async convertMediaToAnime(media: Media, fullInfo: boolean = true): Promise<MultiProviderResult> {
        const providerInfos = new ListProviderLocalData(KitsuProvider.getInstance());

        providerInfos.addSeriesName(new Name(media.titles.en, 'en'));
        providerInfos.addSeriesName(new Name(media.titles.en_us, 'en_us', NameType.OFFICIAL));
        providerInfos.addSeriesName(new Name(media.titles.ja_jp, 'jap'));

        providerInfos.addSeriesName(new Name(media.slug, 'slug', NameType.SLUG));
        providerInfos.addSeriesName(new Name(media.titles.en_us, 'en_us'));
        providerInfos.addSeriesName(new Name(media.canonicalTitle, 'canonicalTitle'));

        providerInfos.addOverview(new Overview(media.synopsis, 'eng'));

        providerInfos.releaseYear = new Date(media.startDate).getFullYear();
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


        providerInfos.fullInfo = fullInfo;
        providerInfos.id = media.id;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;
        providerInfos.lastExternalChange = new Date(media.updatedAt);
        if (media.episodes) {
            providerInfos.detailEpisodeInfo.push(...await this.convertKitsuEpisodesToEpisodes(media.episodes));
        }

        const mpr = new MultiProviderResult(providerInfos);;
        if (media.mappings) {
            const providers = await this.convertKitsuMappingsToProvider(media.mappings);
            mpr.subProviders.push(...providers);
        }
        return mpr;
    }

    async convertKitsuMappingsToProvider(mappings: KitsuMappings[]): Promise<ProviderLocalData[]> {
        const providerLocalData: ProviderLocalData[] = [];
        for (const mapping of mappings) {
            if (mapping.externalSite == 'anidb') {
                const localdata = new InfoProviderLocalData(AniDBProvider.instance.providerName);
                localdata.id = mapping.externalId;
                providerLocalData.push(localdata);
            } else if (mapping.externalSite == 'aotora') {
                const localdata = new InfoProviderLocalData('aotora');
                localdata.id = mapping.externalId;
                providerLocalData.push(localdata);
            } else if (mapping.externalSite == 'anilist') {
                const localdata = new ListProviderLocalData(AniListProvider.getInstance().providerName);
                localdata.id = mapping.externalId;
                providerLocalData.push(localdata);
            } else if (mapping.externalSite == 'hulu') {
                const localdata = new StreamingProviderLocalData('hulu');
                localdata.id = mapping.externalId;
                providerLocalData.push(localdata);
            } else if (mapping.externalSite == 'myanimelist/anime') {
                const localdata = new ListProviderLocalData('myanimelist');
                localdata.mediaType = MediaType.ANIME;
                localdata.id = mapping.externalId;
                providerLocalData.push(localdata);
            } else if (mapping.externalSite == 'myanimelist/manga') {
                const localdata = new ListProviderLocalData('myanimelist');
                localdata.mediaType = MediaType.UNKOWN;
                localdata.id = mapping.externalId;
                providerLocalData.push(localdata);
            }
        }
        const result = mappings.find(x => x.externalSite.includes('thetvdb') && x.externalId.includes('/'));
        if (result) {
            const localdata = new InfoProviderLocalData(TVDBProvider.Instance.providerName);
            const idSeason = result.externalId.split('/');
            localdata.id = idSeason[0];
            localdata.targetSeason = Number(idSeason[1]);
            providerLocalData.push(localdata);
        }
        return providerLocalData;
    }

    async convertKitsuEpisodesToEpisodes(episodes: KitsuEpisode[]): Promise<Episode[]> {
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

    convertShowTypeToMediaType(showType: string): MediaType {
        if (showType == "ONA") {
            return MediaType.SPECIAL;
        } else if (showType == "OVA") {
            return MediaType.SPECIAL;
        } else if (showType == "TV") {
            return MediaType.ANIME;
        } else if (showType == "movie") {
            return MediaType.MOVIE;
        } else if (showType == "music") {
            return MediaType.SPECIAL;
        } else if (showType == "special") {
            return MediaType.SPECIAL;
        }
        return MediaType.UNKOWN;
    }
}
