import Anime, { WatchStatus } from '../../../backend/controller/objects/anime';
import { ProviderInfo } from '../../../backend/controller/objects/providerInfo';
import { Medium } from './graphql/searchSeries';
import { GetSeriesByID } from './graphql/getSeriesByID';
import Overview from '../../../backend/controller/objects/overview';
import Name from '../../../backend/controller/objects/name';
import aniListProvider from './aniListProvider';
import { Entry, MediaRelation } from './graphql/seriesList';
import AniListProvider from './aniListProvider';

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
        anime.addOverview(new Overview(info.Media.description, 'eng'));
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

    public async convertListEntryToAnime(entry: Entry, watchStatus: WatchStatus): Promise<Anime> {
        var series: Anime = new Anime();
        series.names.engName = entry.media.title.english;
        series.names.mainName = entry.media.title.native;
        series.names.romajiName = entry.media.title.romaji;
        await series.names.fillNames();

        series.releaseYear = entry.media.startDate.year;
        series.seasonNumber = await series.names.getSeasonNumber();

        var providerInfo: ProviderInfo = new ProviderInfo(AniListProvider.getInstance());
        try {
            if (typeof series.seasonNumber === 'undefined') {
                if (entry.media.relations.edges.findIndex(x => x.relationType === MediaRelation.PREQUEL) === -1) {
                    series.seasonNumber = 1;
                } else {

                }
            }
            let prequel = entry.media.relations.edges.findIndex(x => x.relationType === MediaRelation.PREQUEL);
            if (prequel != -1) {
                providerInfo.prequelId = entry.media.relations.nodes[prequel].id
            }
            let sequel = entry.media.relations.edges.findIndex(x => x.relationType === MediaRelation.SEQUEL);
            if (sequel != -1) {
                providerInfo.sequelId = entry.media.relations.nodes[sequel].id
            }
        } catch (err) {
            console.error(err);
        }

        providerInfo.id = entry.media.id;
        providerInfo.score = entry.score;
        providerInfo.rawEntry = entry;
        if (entry.progress != 0) {
            for (let index = 0; index < entry.progress; index++) {
                providerInfo.addOneEpisode(index + 1);
            }
        }

        providerInfo.watchStatus = watchStatus;
        providerInfo.lastExternalChange = new Date(entry.updatedAt);

        if (typeof entry.media.episodes != 'undefined') {
            providerInfo.episodes = entry.media.episodes;
        }

        series.providerInfos.push(providerInfo);
        return series;
    }
}
