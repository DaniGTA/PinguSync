import { Show } from './objects/search';
import { Show as WatchedShow } from './objects/watchedInfo';
import Anime from '../../../backend/controller/objects/anime';
import { ProviderInfo } from '../../../backend/controller/objects/providerInfo';
import { FullShowInfo } from './objects/fullShowInfo';
import Overview from '../../../backend/controller/objects/overview';
import TraktProvider from './traktProvider';
export default new class TraktConverter {
    convertShowToAnime(show: Show | WatchedShow): Anime {
        const anime = new Anime();
        anime.names.engName = show.title;
        anime.releaseYear = show.year;
        const provider = new ProviderInfo(TraktProvider.getInstance());
        provider.id = show.ids.trakt;
        provider.rawEntry = show;
        anime.providerInfos.push(provider);
        return anime;
    }
    convertFullShowInfoToAnime(fullShow: FullShowInfo): Anime {
        const anime = new Anime();
        anime.names.engName = fullShow.title;
        anime.releaseYear = fullShow.year;
        anime.episodes = fullShow.aired_episodes;
        anime.overviews.push(new Overview(fullShow.overview, 'eng'));
        anime.runTime = fullShow.runtime;
        const provider = new ProviderInfo(TraktProvider.getInstance());
        provider.id = fullShow.ids.trakt;
        provider.rawEntry = fullShow;
        provider.publicScore = fullShow.rating;
        anime.providerInfos.push(provider);
        return anime;
    }
}