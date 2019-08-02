import Series, { WatchStatus } from '../../controller/objects/series';
import { Medium } from './graphql/searchSeries';
import { GetSeriesByID } from './graphql/getSeriesByID';
import Overview from '../../../backend/controller/objects/overview';
import Name from '../../../backend/controller/objects/name';
import aniListProvider from './anilistProvider';
import { Entry, MediaRelation } from './graphql/seriesList';
import AniListProvider from './anilistProvider';
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';

export default new class AniListConverter {
    public async convertMediaToAnime(medium: Medium): Promise<Series> {
        const series = new Series();
        series.episodes = medium.episodes;
        series.names.engName = medium.title.english;
        series.names.mainName = medium.title.native;
        series.names.romajiName = medium.title.romaji;
        series.names.fillNames();
        series.releaseYear = medium.startDate.year;
        series.coverImage = medium.coverImage.large;

        const provider = new ListProviderLocalData(aniListProvider.getInstance());
        provider.id = medium.id;
        provider.score = medium.averageScore;
        provider.episodes = medium.episodes;
        series.listProviderInfos.push(provider);
        return series;
    }

    public async convertExtendedInfoToAnime(info: GetSeriesByID): Promise<Series> {
        const series = new Series();
        series.coverImage = info.Media.coverImage.large;
        series.addOverview(new Overview(info.Media.description, 'eng'));
        series.episodes = info.Media.episodes;
        series.releaseYear = info.Media.startDate.year;
        series.names.engName = info.Media.title.english;
        series.names.mainName = info.Media.title.native;
        series.names.romajiName = info.Media.title.romaji;
        series.names.otherNames.push(new Name(info.Media.title.userPreferred, 'userPreferred'));

        const provider = new ListProviderLocalData(aniListProvider.getInstance());
        provider.id = info.Media.id;
        provider.score = info.Media.averageScore;
        provider.episodes = info.Media.episodes;
        series.listProviderInfos.push(provider);
        return series;
    }

    public async convertListEntryToAnime(entry: Entry, watchStatus: WatchStatus): Promise<Series> {
        var series: Series = new Series();
        series.names.engName = entry.media.title.english;
        series.names.mainName = entry.media.title.native;
        series.names.romajiName = entry.media.title.romaji;
        await series.names.fillNames();

        series.releaseYear = entry.media.startDate.year;
        series.seasonNumber = await series.names.getSeasonNumber();

        var providerInfo: ListProviderLocalData = new ListProviderLocalData(AniListProvider.getInstance());
        try {
            if (typeof series.seasonNumber === 'undefined') {
                if (entry.media.relations.edges.findIndex(x => x.relationType == MediaRelation.PREQUEL) === -1) {
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
        providerInfo.targetSeason = series.seasonNumber;
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

        series.listProviderInfos.push(providerInfo);
        return series;
    }
}
