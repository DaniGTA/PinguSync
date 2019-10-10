import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeTitle from '../../controller/objects/meta/episode/episode-title';
import Genre from '../../controller/objects/meta/genre';
import { MediaType } from '../../controller/objects/meta/media-type';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import Overview from '../../controller/objects/meta/overview';
import Series, { WatchStatus } from '../../controller/objects/series';
import MultiProviderResult from '../multi-provider-result';
import TVDBProvider from '../tvdb/tvdb-provider';
import { FullShowInfo } from './objects/fullShowInfo';
import { Movie, Show } from './objects/search';
import { Season, SendEntryUpdate, Show as SendEntryShow, TraktEpisode } from './objects/sendEntryUpdate';
import { TraktShowSeasonInfo } from './objects/showSeasonInfo';
import { Show as WatchedShow, WatchedInfo } from './objects/watchedInfo';
import TraktProvider from './trakt-provider';
export default new class TraktConverter {
    public async convertSeasonsToSeries(watchedInfo: WatchedInfo): Promise<Series[]> {
        const result = [];
        for (const season of watchedInfo.seasons) {
            const series: Series = new Series();


            const providerInfo: ListProviderLocalData = new ListProviderLocalData(TraktProvider.getInstance());
            providerInfo.addSeriesName(new Name(watchedInfo.show.title, 'en', NameType.OFFICIAL));
            providerInfo.addSeriesName(new Name(watchedInfo.show.ids.slug, 'slug', NameType.SLUG));
            if (season.number == 1) {
                providerInfo.releaseYear = watchedInfo.show.year;
            }
            providerInfo.id = watchedInfo.show.ids.trakt;
            providerInfo.rawEntry = watchedInfo;
            for (const episode of season.episodes) {
                providerInfo.addOneWatchedEpisode(episode.number, episode.plays, episode.last_watched_at);
            }
            providerInfo.targetSeason = season.number;
            providerInfo.watchStatus = WatchStatus.COMPLETED;
            providerInfo.lastExternalChange = watchedInfo.last_watched_at;
            providerInfo.hasFullInfo = false;
            series.addListProvider(providerInfo);
            result.push(series);
        }
        return result;
    }

    public async convertShowToLocalData(show: Show | WatchedShow): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(TraktProvider.getInstance());
        try {
            provider.addSeriesName(new Name(show.title, 'en', NameType.OFFICIAL));
        } catch (err) { }

        provider.addSeriesName(new Name(show.ids.slug, 'slug', NameType.SLUG));
        provider.releaseYear = show.year;
        provider.id = show.ids.trakt;
        provider.rawEntry = show;

        const result = new MultiProviderResult(provider);
        try {
            const tvdbProvider = new InfoProviderLocalData(TVDBProvider.Instance.providerName);
            tvdbProvider.id = show.ids.tvdb;
            tvdbProvider.hasFullInfo = false;
            result.subProviders.push(tvdbProvider);
        } catch (err) {
            console.log('no tvdb instance.');
        }
        return result;
    }

    public async convertMovieToLocalData(traktMovie: Movie | WatchedShow): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(TraktProvider.getInstance());
        try {
            provider.addSeriesName(new Name(traktMovie.title, 'en', NameType.OFFICIAL));
        } catch (err) { }
        provider.addSeriesName(new Name(traktMovie.ids.slug, 'slug', NameType.SLUG));
        provider.releaseYear = traktMovie.year;
        provider.id = traktMovie.ids.trakt;
        provider.rawEntry = traktMovie;
        provider.mediaType = MediaType.MOVIE;

        return new MultiProviderResult(provider);
    }

    public async convertFullShowInfoToLocalData(fullShow: FullShowInfo, seasonInfo?: TraktShowSeasonInfo[]): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(TraktProvider.getInstance());
        provider.addSeriesName(new Name(fullShow.title, 'en', NameType.OFFICIAL));
        provider.addSeriesName(new Name(fullShow.ids.slug, 'slug', NameType.SLUG));

        provider.addOverview(new Overview(fullShow.overview, 'eng'));
        provider.runTime = fullShow.runtime;
        provider.releaseYear = fullShow.year;
        provider.id = fullShow.ids.trakt;
        provider.rawEntry = fullShow;
        provider.publicScore = fullShow.rating;
        provider.episodes = fullShow.aired_episodes;
        if (fullShow.genres && Array.isArray(fullShow.genres)) {
            for (const genre of fullShow.genres) {
                provider.genres.push(new Genre(genre));
            }
        }
        provider.hasFullInfo = true;
        if (seasonInfo) {
            provider.detailEpisodeInfo = await this.getDetailedEpisodeInfo(seasonInfo);
        }
        const tvdbProvider = new InfoProviderLocalData(TVDBProvider.Instance.providerName);
        tvdbProvider.id = fullShow.ids.tvdb;
        return new MultiProviderResult(provider, tvdbProvider);
    }

    public async getDetailedEpisodeInfo(seasonInfos: TraktShowSeasonInfo[]): Promise<Episode[]> {
        const detailedEpisodes: Episode[] = [];
        for (const seasonInfo of seasonInfos) {
            for (const episode of seasonInfo.episodes) {
                const tempEpisode = new Episode(seasonInfo.number, episode.number);
                tempEpisode.title = [new EpisodeTitle(episode.title)];
                tempEpisode.providerEpisodeId = episode.ids.trakt;
                detailedEpisodes.push(tempEpisode);
            }
        }
        return detailedEpisodes;
    }

    public async convertAnimeToSendRemoveEntryShow(series: Series, removeEpisode: number): Promise<SendEntryUpdate> {
        const currentProvider = series.getListProvidersInfos().find((x) => x.provider === TraktProvider.getInstance().providerName);
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
                number: seasonNumber,
                episodes,
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
        const currentProvider = series.getListProvidersInfos().find((x) => x.provider === TraktProvider.getInstance().providerName);
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
                        if (newWatchprogress == index || currentProvider.watchProgress.findIndex((x) => x.episode === index) === -1) {
                            episodes.push({ number: index });
                        }
                    } else {
                        episodes.push({ number: index });
                    }
                }
                const season: Season = {
                    number: seasonNumber,
                    episodes,
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
