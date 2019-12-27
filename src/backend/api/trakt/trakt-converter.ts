
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeTitle from '../../controller/objects/meta/episode/episode-title';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Genre from '../../controller/objects/meta/genre';
import { MediaType } from '../../controller/objects/meta/media-type';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import Overview from '../../controller/objects/meta/overview';
import Series, { WatchStatus } from '../../controller/objects/series';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import ProviderNameManager from '../../controller/provider-manager/provider-name-manager';
import titleCheckHelper from '../../helpFunctions/title-check-helper';
import logger from '../../logger/logger';
import MultiProviderResult from '../provider/multi-provider-result';
import TVDBProvider from '../tvdb/tvdb-provider';
import { FullShowInfo } from './objects/fullShowInfo';
import { Movie, Show } from './objects/search';
import { Season, SendEntryUpdate, Show as SendEntryShow, TraktEpisode } from './objects/sendEntryUpdate';
import ITraktShowSeasonInfo from './objects/showSeasonInfo';
import { Show as WatchedShow, WatchedInfo } from './objects/watchedInfo';
import TraktProvider from './trakt-provider';
export default new class TraktConverter {
    public async convertSeasonsToMultiProviderResult(watchedInfo: WatchedInfo): Promise<MultiProviderResult[]> {
        const result = [];
        for (const season of watchedInfo.seasons) {
            const providerInfo: ListProviderLocalData = new ListProviderLocalData(watchedInfo.show.ids.trakt, TraktProvider.getInstance());
            providerInfo.addSeriesName(new Name(watchedInfo.show.title, 'en', NameType.OFFICIAL));
            providerInfo.addSeriesName(new Name(watchedInfo.show.ids.slug, 'slug', NameType.SLUG));
            if (season.number === 1) {
                providerInfo.releaseYear = watchedInfo.show.year;
            }
            providerInfo.rawEntry = watchedInfo;
            for (const episode of season.episodes) {
                providerInfo.addOneWatchedEpisode(episode.number, episode.plays, episode.last_watched_at);
            }
            providerInfo.targetSeason = season.number;
            providerInfo.watchStatus = WatchStatus.COMPLETED;
            providerInfo.lastExternalChange = watchedInfo.last_watched_at;
            providerInfo.infoStatus = ProviderInfoStatus.BASIC_INFO;
            result.push(new MultiProviderResult(providerInfo));
        }
        return result;
    }

    public async convertShowToLocalData(show: Show | WatchedShow): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(show.ids.trakt, TraktProvider.getInstance());
        try {
            provider.addSeriesName(new Name(show.title, 'en', NameType.OFFICIAL));
        } catch (err) {
            logger.debug(err);
         }

        provider.addSeriesName(new Name(show.ids.slug, 'slug', NameType.SLUG));
        provider.releaseYear = show.year;
        provider.rawEntry = show;

        const result = new MultiProviderResult(provider);
        try {
            if (show.ids.tvdb) {
                const tvdbProvider = new InfoProviderLocalData(show.ids.tvdb, TVDBProvider.Instance);
                result.subProviders.push(tvdbProvider);
            }
        } catch (err) {
            logger.error('[TVDBConverter] No tvdb instance.');
        }
        return result;
    }

    public async convertMovieToLocalData(traktMovie: Movie | WatchedShow): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(traktMovie.ids.trakt, TraktProvider.getInstance());
        try {
            provider.addSeriesName(new Name(traktMovie.title, 'en', NameType.OFFICIAL));
        } catch (err) {
            logger.debug(err);
        }
        provider.addSeriesName(new Name(traktMovie.ids.slug, 'slug', NameType.SLUG));
        provider.releaseYear = traktMovie.year;
        provider.rawEntry = traktMovie;
        provider.mediaType = MediaType.MOVIE;

        return new MultiProviderResult(provider);
    }

    public combineSeasonInfoAndSeasonEpisodeInfo(seasonInfo: ITraktShowSeasonInfo[], seasonEpisodeInfo: ITraktShowSeasonInfo[]): ITraktShowSeasonInfo[] {
        const finalList: ITraktShowSeasonInfo[] = [];
        for (const singleSeason of seasonInfo) {
            const episodeInfo = seasonEpisodeInfo.find((x) => x.number === singleSeason.number);
            finalList.push({ ...singleSeason, ...episodeInfo });
        }
        return finalList;
    }

    public async convertFullShowInfoToLocalData(fullShow: FullShowInfo, seasonInfo?: ITraktShowSeasonInfo[]): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(fullShow.ids.trakt, TraktProvider.getInstance());
        provider.addSeriesName(new Name(fullShow.title, 'en', NameType.OFFICIAL));
        provider.addSeriesName(new Name(fullShow.ids.slug, 'slug', NameType.SLUG));

        provider.addOverview(new Overview(fullShow.overview, 'eng'));
        provider.runTime = fullShow.runtime;
        provider.releaseYear = fullShow.year;
        provider.rawEntry = fullShow;
        provider.publicScore = fullShow.rating;
        provider.episodes = fullShow.aired_episodes;
        if (fullShow.genres && Array.isArray(fullShow.genres)) {
            for (const genre of fullShow.genres) {
                provider.genres.push(new Genre(genre));
            }
        }
        provider.infoStatus = ProviderInfoStatus.FULL_INFO;
        if (seasonInfo) {
            try {
                provider.detailEpisodeInfo = await this.getDetailedEpisodeInfo(seasonInfo);
            } catch (err) {
                logger.error('[Trakt] Error: Failed to convert episode infos.');
                logger.error(err);
            }
        }
        const multiProviderResult = new MultiProviderResult(provider);
        if (fullShow.ids.tvdb) {
            multiProviderResult.subProviders.push(new InfoProviderLocalData(fullShow.ids.tvdb, TVDBProvider.Instance));
        }
        if (fullShow.ids.imdb) {
            multiProviderResult.subProviders.push(new InfoProviderLocalData(fullShow.ids.imdb, 'imdb'));
        }
        if (fullShow.ids.tmdb) {
            multiProviderResult.subProviders.push(new InfoProviderLocalData(fullShow.ids.tmdb, 'tmdb'));
        }

        return multiProviderResult;
    }

    public async getDetailedEpisodeInfo(seasonInfos: ITraktShowSeasonInfo[]): Promise<Episode[]> {
        const detailedEpisodes: Episode[] = [];
        for (const seasonInfo of seasonInfos) {
            let seasonNumber = seasonInfo.title ? await (await titleCheckHelper.getSeasonNumberBySeasonMarkerInTitle(seasonInfo.title)).seasonNumber : '';
            if (seasonInfo.episodes) {
                for (const episode of seasonInfo.episodes) {
                    if (seasonNumber === undefined || Number.isNaN(seasonNumber as number)) {
                        seasonNumber = seasonInfo.number;
                    }
                    const tempEpisode = new Episode(episode.number, seasonNumber as number);
                    tempEpisode.title = [new EpisodeTitle(episode.title)];
                    tempEpisode.providerEpisodeId = episode.ids.trakt;
                    if (seasonInfo.title && seasonInfo.title.toLowerCase().includes('special')) {
                        tempEpisode.type = EpisodeType.SPECIAL;
                    }
                    detailedEpisodes.push(tempEpisode);
                }
            } else if (seasonInfo.episode_count) {
                for (let index = 1; index < seasonInfo.episode_count; index++) {
                    if (seasonNumber !== undefined && Number.isNaN(seasonNumber as number)) {
                        seasonNumber = seasonInfo.number;
                    }
                    const tempEpisode = new Episode(index, seasonNumber as number);
                    if (seasonInfo.title && seasonInfo.title.includes('special')) {
                        tempEpisode.type = EpisodeType.SPECIAL;
                    }
                    detailedEpisodes.push(tempEpisode);

                }
            }
        }
        return detailedEpisodes;
    }

    public async convertAnimeToSendRemoveEntryShow(series: Series, removeEpisode: number): Promise<SendEntryUpdate> {
        const currentProvider = series.getListProvidersInfos().find((x) => x.provider === ProviderNameManager.getProviderName(TraktProvider));
        const seasonNumber = (await series.getSeason()).seasonNumber;
        if (typeof currentProvider !== 'undefined' && seasonNumber) {

            const episodes: TraktEpisode[] = [];

            episodes.push({ number: removeEpisode });

            const sendEntryShow: SendEntryShow = {
                ids: {
                    trakt: currentProvider.id as number,
                },
                seasons: [],
            };

            const season: Season = {
                episodes,
                number: seasonNumber,
            };

            sendEntryShow.seasons.push(season);

            const sendEntryUpdate: SendEntryUpdate = {
                shows: [sendEntryShow],
            };
            return sendEntryUpdate;
        }
        throw new Error('failed convert');
    }

    public async convertAnimeToSendEntryShow(series: Series, newWatchprogress: number): Promise<SendEntryUpdate> {
        const currentProvider = series.getListProvidersInfos().find((x) => x.provider === ProviderNameManager.getProviderName(TraktProvider));
        let seasonNumber = (await series.getSeason()).seasonNumber;
        if (currentProvider && seasonNumber) {

            const episodes: TraktEpisode[] = [];
            const maxEpisodes = currentProvider.episodes || newWatchprogress;

            const sendEntryShow: SendEntryShow = {
                ids: {
                    trakt: currentProvider.id as number,
                },
                seasons: [],

            };
            for (let i = 1; i < maxEpisodes; i++) {

                for (let index = 1; (index < newWatchprogress + 1 && index < maxEpisodes + 1 && i < newWatchprogress + 1); index++) {
                    if (currentProvider.watchProgress) {
                        if (newWatchprogress === index || currentProvider.watchProgress.findIndex((x) => x.episode === index) === -1) {
                            episodes.push({ number: index });
                        }
                    } else {
                        episodes.push({ number: index });
                    }
                }
                const season: Season = {
                    episodes,
                    number: seasonNumber,
                };

                sendEntryShow.seasons.push(season);

                seasonNumber++;
            }
            const sendEntryUpdate: SendEntryUpdate = {
                shows: [sendEntryShow],
            };
            return sendEntryUpdate;
        }
        throw new Error('failed convert');
    }
}();
