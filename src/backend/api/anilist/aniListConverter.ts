import Anime from '../../../backend/controller/objects/anime';
import { ProviderInfo } from '../../../backend/controller/objects/providerInfo';
import { Medium } from './graphql/searchSeries';
import { GetSeriesByID } from './graphql/getSeriesByID';
import Overview from '../../../backend/controller/objects/overview';
import Name from '../../../backend/controller/objects/name';
import aniListProvider from './aniListProvider';

export default new class AniListConverter {
    public async convertMediaToAnime(medium: Medium): Promise<Anime> {
        const anime = new Anime();
        anime.episodes = medium.episodes;
        anime.names.engName = medium.title.english;
        anime.names.mainName = medium.title.native;
        anime.names.romajiName = medium.title.romaji;
        anime.names.fillNames();
        anime.releaseYear = medium.startDate.year;
        anime.coverImage = medium.coverImage.large;

        const provider = new ProviderInfo(aniListProvider.getInstance());
        provider.id = medium.id;
        provider.score = medium.averageScore;
        provider.episodes = medium.episodes;
        anime.providerInfos.push(provider);
        return anime;
    }

    public async convertExtendedInfoToAnime(info: GetSeriesByID): Promise<Anime> {
        const anime = new Anime();
        anime.coverImage = info.Media.coverImage.large;
        anime.overviews.push(new Overview(info.Media.description, 'eng'));
        anime.episodes = info.Media.episodes;
        anime.releaseYear = info.Media.startDate.year;
        anime.names.engName = info.Media.title.english;
        anime.names.mainName = info.Media.title.native;
        anime.names.romajiName = info.Media.title.romaji;
        anime.names.otherNames.push(new Name(info.Media.title.userPreferred, 'userPreferred'));

        const provider = new ProviderInfo(aniListProvider.getInstance());
        provider.id = info.Media.id;
        provider.score = info.Media.averageScore;
        provider.episodes = info.Media.episodes;
        anime.providerInfos.push(provider);
        return anime;

    }
}