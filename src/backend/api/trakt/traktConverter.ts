import { Show } from './objects/search';
import { Show as WatchedShow } from './objects/watchedInfo';
import { Show as SendEntryShow, Season, Episode } from './objects/sendEntryUpdate';
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

    async convertAnimeToSendEntryShow(anime: Anime, newWatchprogress: number): Promise<SendEntryShow> {
        let currentProvider = anime.providerInfos.find(x => x.provider === TraktProvider.name);
        if (typeof currentProvider != 'undefined' && typeof anime.seasonNumber != 'undefined') {

            var episodes: Episode[] = [];
            for (let index = 0; index < newWatchprogress; index++) {
                episodes.push({ number: index });
            }
            var season: Season = {
                number: anime.seasonNumber,
                episodes: episodes,
            }
            let sendEntryShow: SendEntryShow = {
                ids: {
                    trakt: currentProvider.id as number
                },
                seasons: [season]

            };
            return sendEntryShow;
        }
        throw 'failed convert';
    }
}