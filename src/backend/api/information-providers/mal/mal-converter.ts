import { ListType } from './../../../controller/settings/models/provider/list-types';
import { Jikan, Mal } from 'node-myanimelist';
import Banner from '../../../controller/objects/meta/banner';
import Cover from '../../../controller/objects/meta/cover';
import Episode from '../../../controller/objects/meta/episode/episode';
import Genre from '../../../controller/objects/meta/genre';
import { ImageSize } from '../../../controller/objects/meta/image-size';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import { NameType } from '../../../controller/objects/meta/name-type';
import Overview from '../../../controller/objects/meta/overview';
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import logger from '../../../logger/logger';
import MultiProviderResult from '../../provider/multi-provider-result';
import MalProvider from './mal-provider';
import { AnimeListStatusBase } from 'node-myanimelist/typings/methods/malApi/anime';
import WatchHistory from '../../../controller/objects/meta/episode/episode-watch-history';

export default class MalConverter {
    public static async convertAnimeToProviderData(anime: Jikan.Anime.Anime): Promise<MultiProviderResult> {
        const animeInfo = await anime.info();
        const lpd = new ListProviderLocalData(animeInfo.mal_id, MalProvider);
        lpd.releaseYear = animeInfo.aired.prop.from.year ?? undefined;
        lpd.mediaType = this.getTypeByAnimeInfo(animeInfo);
        lpd.covers.push(this.getCover(animeInfo));
        lpd.genres.push(...this.getGeneres(animeInfo));
        lpd.runTime = parseInt(animeInfo.duration ?? '') ?? undefined;
        lpd.addSeriesName(...this.getTitles(animeInfo));
        if (animeInfo.synopsis)
            lpd.addOverview(new Overview(animeInfo.synopsis, 'en'));
        lpd.publicScore = animeInfo.score ?? undefined;

        if (animeInfo.related['Side story'])
            lpd.alternativeIds.push(...animeInfo.related['Side story'].map(x => x.mal_id));
        if ((animeInfo.related as any)['Other'])
            lpd.alternativeIds.push(...(animeInfo.related as any)['Other'].map((x: any) => x.mal_id));
        if ((animeInfo.related as any)['Sequel'])
            lpd.sequelIds.push(...(animeInfo.related as any)['Sequel'].map((x: any) => x.mal_id));
        if ((animeInfo.related as any)['Prequel'])
            lpd.prequelIds.push(...(animeInfo.related as any)['Prequel'].map((x: any) => x.mal_id));
        const episodes = await this.getDetailedEpisodes(anime);
        if (episodes.length === 0) {
            lpd.infoStatus = ProviderInfoStatus.BASIC_INFO;
        } else {
            lpd.infoStatus = ProviderInfoStatus.FULL_INFO;
            lpd.addDetailedEpisodeInfos(...episodes);
        }
        return new MultiProviderResult(lpd);
    }

    private static async getDetailedEpisodes(anime: Jikan.Anime.Anime): Promise<Episode[]> {
        try {
            const episodes = (await anime.episodes());
            return episodes.episodes.map((x, index) => this.convertMalEpisodeToEpisode(x));
        } catch (err) {
            return [];
        }
    }

    private static convertMalEpisodeToEpisode(ep: Jikan.Anime.EpisodeListItem): Episode {
        const episode = new Episode(ep.episode_id);
        episode.isFiller = ep.filler;
        episode.isRecap = ep.recap;
        episode.airDate = new Date(ep.aired as any);
        const titles = [];
        titles.push(new Name(ep.title, 'unknown', NameType.MAIN));
        if (ep.title_romanji)
            titles.push(new Name(ep.title_romanji, 'romanji', NameType.OFFICIAL));
        if (ep.title_japanese)
            titles.push(new Name(ep.title_japanese, 'jap', NameType.OFFICIAL));
        return episode;
    }

    private static getCover(info: Jikan.Anime.AnimeInfo): Cover {
        return new Cover(info.image_url, ImageSize.MEDIUM);
    }

    private static getBackground(info: Jikan.Anime.AnimeInfo): Banner | undefined {
        if (info.background)
            return new Banner(info.background, ImageSize.LARGE);
    }

    private static getGeneres(info: Jikan.Anime.AnimeInfo): Genre[] {
        return info.genres.map(x => new Genre(x.name));
    }

    private static getTitles(info: Jikan.Anime.AnimeInfo): Name[] {
        const titles: Name[] = [];
        titles.push(new Name(info.title, 'unknown', NameType.MAIN));
        if (info.title_english)
            titles.push(new Name(info.title_english, 'en', NameType.OFFICIAL));
        if (info.title_japanese)
            titles.push(new Name(info.title_japanese, 'jap', NameType.OFFICIAL));
        titles.push(...info.title_synonyms.map(x => new Name(x, 'unknown', NameType.SYN)));
        return titles;
    }

    public static convertSearchResultData(animeInfo: any): ListProviderLocalData {
        const lpd = new ListProviderLocalData(animeInfo.mal_id, MalProvider);
        lpd.episodes = animeInfo.episodes;
        lpd.releaseYear = new Date(animeInfo.start_date).getFullYear();
        lpd.publicScore = animeInfo.score;
        lpd.covers.push(new Cover(animeInfo.image_url, ImageSize.LARGE));
        lpd.mediaType = this.getTypeByAnimeInfo(animeInfo);
        lpd.addSeriesName(new Name(animeInfo.title, 'en', NameType.MAIN));
        if (animeInfo.synopsis)
            lpd.addOverview(new Overview(animeInfo.synopsis, 'en'));
        return lpd;
    }

    private static getTypeByAnimeInfo(animeInfo: Jikan.Anime.AnimeInfo) {
        if (animeInfo.type === 'TV') {
            return MediaType.ANIME;
        } else if (animeInfo.type === 'Movie') {
            return MediaType.MOVIE;
        } else if (animeInfo.type === 'Special') {
            return MediaType.SPECIAL;
        } else if (animeInfo.type === 'OVA') {
            return MediaType.OVA;
        } else if (animeInfo.type === 'ONA') {
            return MediaType.ONA;
        } else if (animeInfo.type === 'Music') {
            return MediaType.MUSIC;
        } else {
            logger.warn('[MAL CONVERTER] Unkown media type:' + animeInfo.type);
        }
        return MediaType.UNKOWN;
    }

    private static convertWatchStatus(watchStatus: AnimeListStatusBase['status'], isRewatching: boolean): ListType {
        if (isRewatching) {
            return ListType.REPEATING;
        } else if (watchStatus == 'watching') {
            return ListType.CURRENT;
        } else if (watchStatus == 'plan_to_watch') {
            return ListType.PLANNING;
        } else if (watchStatus == 'completed') {
            return ListType.COMPLETED;
        } else if (watchStatus == 'dropped') {
            return ListType.DROPPED;
        } else if (watchStatus == 'on_hold') {
            return ListType.PAUSED;
        } else {
            return ListType.UNKOWN;
        }
    }
    public static convertMalListToMultiProviderResult(lists: Mal.Common.Paging<Mal.User.AnimeListItem<Mal.Common.WorkBase, Mal.Anime.AnimeListStatusBase>>): MultiProviderResult[] {
        const multiProviderResultList: MultiProviderResult[] = [];
        for (const entry of lists.data) {
            const p = new ListProviderLocalData(entry.node.id, MalProvider);
            p.infoStatus = ProviderInfoStatus.BASIC_INFO;
            for (let index = 1; index < (entry.list_status.num_episodes_watched + 1); index++) {
                const ep = new Episode(index);
                ep.watchHistory.push(new WatchHistory());
                p.addDetailedEpisodeInfos(ep);
            }
            p.watchStatus = this.convertWatchStatus(entry.list_status.status, entry.list_status.is_rewatching);
            p.addSeriesName(new Name(entry.node.title, 'en', NameType.MAIN));
            p.covers.push(...this.convertMainPicturToCovers(entry.node.main_picture));
            multiProviderResultList.push(new MultiProviderResult(p));
        }
        return multiProviderResultList;
    }

    private static convertMainPicturToCovers(mainPicture: Mal.Common.Picture | null): Cover[] {
        const covers: Cover[] = [];
        if (mainPicture) {
            if (mainPicture.large)
                covers.push(new Cover(mainPicture.large, ImageSize.LARGE));
            if (mainPicture.medium)
                covers.push(new Cover(mainPicture.medium, ImageSize.MEDIUM));
        }
        return covers;
    }
}
