import { Show, Movie } from './objects/search';
import { Show as WatchedShow, WatchedInfo } from './objects/watchedInfo';
import { Show as SendEntryShow, Season, Episode, SendEntryUpdate } from './objects/sendEntryUpdate';
import Series, { WatchStatus } from '../../controller/objects/series';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import { FullShowInfo } from './objects/fullShowInfo';
import Overview from '../../controller/objects/meta/overview';
import TraktProvider from './trakt-provider';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import { MediaType } from '../../controller/objects/meta/media-type';
import TVDBProvider from '../tvdb/tvdb-provider';
export default new class TraktConverter {
    async convertSeasonsToSeries(watchedInfo: WatchedInfo): Promise<Series[]> {
        const result = [];
        for (const season of watchedInfo.seasons) {
            const series: Series = new Series();
            if (season.number == 1) {
                series.releaseYear = watchedInfo.show.year;
            }
            series.addSeriesName(new Name(watchedInfo.show.title, 'en', NameType.OFFICIAL));
            series.addSeriesName(new Name(watchedInfo.show.ids.slug, 'slug', NameType.SLUG));

            const providerInfo: ListProviderLocalData = new ListProviderLocalData(TraktProvider.getInstance());

            providerInfo.id = watchedInfo.show.ids.trakt;
            providerInfo.rawEntry = watchedInfo;
            for (let episode of season.episodes) {
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

    async convertShowToSeries(show: Show | WatchedShow): Promise<Series> {
        const series = new Series();
        try {
            series.addSeriesName(new Name(show.title, 'en', NameType.OFFICIAL));
        } catch (err) { }
        series.addSeriesName(new Name(show.ids.slug, 'slug', NameType.SLUG));
        series.releaseYear = show.year;

        const provider = new ListProviderLocalData(TraktProvider.getInstance());
        provider.id = show.ids.trakt;
        provider.rawEntry = show;
        series.addListProvider(provider);

        const tvdbProvider = new InfoProviderLocalData(TVDBProvider.Instance.providerName);
        tvdbProvider.id = show.ids.tvdb;
        await series.addInfoProvider(tvdbProvider);

        return series;
    }

    async convertMovieToSeries(traktMovie: Movie | WatchedShow): Promise<Series> {
        const movie = new Series();
        try {
            movie.addSeriesName(new Name(traktMovie.title, 'en', NameType.OFFICIAL));
        } catch (err) { }
        movie.addSeriesName(new Name(traktMovie.ids.slug, 'slug', NameType.SLUG));
        movie.releaseYear = traktMovie.year;

        const provider = new ListProviderLocalData(TraktProvider.getInstance());
        provider.id = traktMovie.ids.trakt;
        provider.rawEntry = traktMovie;
        provider.mediaType = MediaType.MOVIE;
        movie.addListProvider(provider);

        return movie;
    }

    async convertFullShowInfoToAnime(fullShow: FullShowInfo): Promise<Series> {
        const series = new Series();
        series.addSeriesName(new Name(fullShow.title, 'en', NameType.OFFICIAL));
        series.addSeriesName(new Name(fullShow.ids.slug, 'slug', NameType.SLUG));
        series.releaseYear = fullShow.year;
        series.overviews.push(new Overview(fullShow.overview, 'eng'));
        series.runTime = fullShow.runtime;

        const provider = new ListProviderLocalData(TraktProvider.getInstance());
        provider.id = fullShow.ids.trakt;
        provider.rawEntry = fullShow;
        provider.publicScore = fullShow.rating;
        provider.episodes = fullShow.aired_episodes;
        series.addListProvider(provider);


        const tvdbProvider = new InfoProviderLocalData(TVDBProvider.Instance.providerName);
        tvdbProvider.id = fullShow.ids.tvdb;
        await series.addInfoProvider(tvdbProvider);
        return series;
    }

    async convertAnimeToSendRemoveEntryShow(series: Series, removeEpisode: number): Promise<SendEntryUpdate> {
        let currentProvider = series.getListProvidersInfos().find(x => x.provider === TraktProvider.getInstance().providerName);
        var seasonNumber = await series.getSeason();
        if (typeof currentProvider != 'undefined' && seasonNumber) {

            var episodes: Episode[] = [];

            episodes.push({ number: removeEpisode });

            let sendEntryShow: SendEntryShow = {
                ids: {
                    trakt: currentProvider.id as number
                },
                seasons: []

            };

            var season: Season = {
                number: seasonNumber,
                episodes: episodes,
            }

            sendEntryShow.seasons.push(season);

            const sendEntryUpdate: SendEntryUpdate = {
                shows: [sendEntryShow]
            }
            return sendEntryUpdate;
        }
        throw 'failed convert';
    }

    async convertAnimeToSendEntryShow(series: Series, newWatchprogress: number): Promise<SendEntryUpdate> {
        let currentProvider = series.getListProvidersInfos().find(x => x.provider === TraktProvider.getInstance().providerName);
        var seasonNumber = await series.getSeason();
        if (typeof currentProvider != 'undefined' && seasonNumber) {

            var episodes: Episode[] = [];
            var maxEpisodes = currentProvider.episodes || newWatchprogress;

            let sendEntryShow: SendEntryShow = {
                ids: {
                    trakt: currentProvider.id as number
                },
                seasons: []

            };
            for (let i = 1; i < maxEpisodes; i++) {

                for (var index = 1; (index < newWatchprogress + 1 && index < maxEpisodes + 1 && i < newWatchprogress + 1); index++) {
                    if (typeof currentProvider.watchProgress != 'undefined') {
                        if (newWatchprogress == index || currentProvider.watchProgress.findIndex(x => x.episode === index) === -1) {
                            episodes.push({ number: index });
                        }
                    } else {
                        episodes.push({ number: index });
                    }
                }
                var season: Season = {
                    number: seasonNumber,
                    episodes: episodes,
                }

                sendEntryShow.seasons.push(season);

                seasonNumber++;
            }
            const sendEntryUpdate: SendEntryUpdate = {
                shows: [sendEntryShow]
            }
            return sendEntryUpdate;
        }
        throw 'failed convert';
    }
}
