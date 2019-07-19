import { Show } from './objects/search';
import { Show as WatchedShow } from './objects/watchedInfo';
import { Show as SendEntryShow, Season, Episode, SendEntryUpdate } from './objects/sendEntryUpdate';
import Anime from '../../../backend/controller/objects/anime';
import { ProviderInfo } from '../../../backend/controller/objects/providerInfo';
import { FullShowInfo } from './objects/fullShowInfo';
import Overview from '../../../backend/controller/objects/overview';
import TraktProvider from './traktProvider';
export default new class TraktConverter {
    async convertShowToAnime(show: Show | WatchedShow): Promise<Anime> {
        const anime = new Anime();
        anime.names.engName = show.title;
        anime.releaseYear = show.year;

        const provider = new ProviderInfo(TraktProvider.getInstance());
        provider.id = show.ids.trakt;
        provider.rawEntry = show;
        anime.providerInfos.push(provider);
        return anime;
    }
    async convertFullShowInfoToAnime(fullShow: FullShowInfo): Promise<Anime> {
        const anime = new Anime();
        anime.names.engName = fullShow.title;
        anime.releaseYear = fullShow.year;
        anime.overviews.push(new Overview(fullShow.overview, 'eng'));
        anime.runTime = fullShow.runtime;

        const provider = new ProviderInfo(TraktProvider.getInstance());
        provider.id = fullShow.ids.trakt;
        provider.rawEntry = fullShow;
        provider.publicScore = fullShow.rating;
        provider.episodes = fullShow.aired_episodes;
        anime.providerInfos.push(provider);
        return anime;
    }

    async convertAnimeToSendRemoveEntryShow(anime: Anime, removeEpisode: number) {
        let currentProvider = anime.providerInfos.find(x => x.provider === TraktProvider.getInstance().providerName);
        if (typeof currentProvider != 'undefined' && typeof anime.seasonNumber != 'undefined') {
            var seasonNumber = anime.seasonNumber;
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

    async convertAnimeToSendEntryShow(anime: Anime, newWatchprogress: number): Promise<SendEntryUpdate> {
        let currentProvider = anime.providerInfos.find(x => x.provider === TraktProvider.getInstance().providerName);
        if (typeof currentProvider != 'undefined' && typeof anime.seasonNumber != 'undefined') {
            var seasonNumber = anime.seasonNumber;
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
