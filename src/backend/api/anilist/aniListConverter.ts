import Series, { WatchStatus } from '../../controller/objects/series';
import { Medium } from './graphql/searchSeries';
import { GetSeriesByID } from './graphql/getSeriesByID';
import Overview from '../../controller/objects/meta/overview';
import Name from '../../controller/objects/meta/name';
import { Entry, MediaRelation } from './graphql/seriesList';
import AniListProvider from './aniListProvider';
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';
import Cover from '../../controller/objects/meta/Cover';
import { CoverSize } from '../../controller/objects/meta/CoverSize';
import { MediaType } from '../../controller/objects/meta/mediaType';
import { MediaFormat } from './graphql/mediaFormat';
import { NameType } from '../../controller/objects/meta/nameType';

export default new class AniListConverter {
    public async convertMediaToAnime(medium: Medium): Promise<Series> {
        const series = new Series();
        series.episodes = medium.episodes;
        series.names.push(new Name(medium.title.romaji,'x-jap',NameType.OFFICIAL));
        series.names.push(new Name(medium.title.english,'unknown',NameType.MAIN));
        series.names.push(new Name(medium.title.native,'jap'));
        series.releaseYear = medium.startDate.year;
        series.mediaType = await this.convertTypeToMediaType(medium.format);

        const provider = new ListProviderLocalData(AniListProvider.getInstance());
        provider.covers.push(new Cover(medium.coverImage.large, CoverSize.LARGE));
        provider.covers.push(new Cover(medium.coverImage.medium, CoverSize.MEDIUM));
        provider.id = medium.id;
        provider.score = medium.averageScore;
        provider.episodes = medium.episodes;
        series.listProviderInfos.push(provider);
        return series;
    }

    private async convertTypeToMediaType(type: MediaFormat): Promise<MediaType> {
        if (type === MediaFormat.MOVIE) {
            return MediaType.MOVIE;
        } else if (type === MediaFormat.TV || type === MediaFormat.TV_SHORT) {
            return MediaType.SERIES;
        } else if (type === MediaFormat.SPECIAL || MediaFormat.OVA || MediaFormat.ONA) {
            return MediaType.SPECIAL;
        }
        return MediaType.UNKOWN;
    }

    public async convertExtendedInfoToAnime(info: GetSeriesByID): Promise<Series> {
        const series = new Series();

        series.addOverview(new Overview(info.Media.description, 'eng'));
        series.episodes = info.Media.episodes;
        series.releaseYear = info.Media.startDate.year;
        series.names.push(new Name(info.Media.title.romaji,'x-jap',NameType.OFFICIAL));
        series.names.push(new Name(info.Media.title.english,'unknown',NameType.MAIN));
        series.names.push(new Name(info.Media.title.native,'jap'));
        series.names.push(new Name(info.Media.title.userPreferred, 'userPreferred'));
        series.mediaType = await this.convertTypeToMediaType(info.Media.format);

        const provider = new ListProviderLocalData(AniListProvider.getInstance());
        provider.covers.push(new Cover(info.Media.coverImage.large, CoverSize.LARGE));
        provider.covers.push(new Cover(info.Media.coverImage.medium, CoverSize.MEDIUM));
        provider.id = info.Media.id;
        provider.score = info.Media.averageScore;
        provider.episodes = info.Media.episodes;
        series.listProviderInfos.push(provider);
        return series;
    }

    public async convertListEntryToAnime(entry: Entry, watchStatus: WatchStatus): Promise<Series> {
        var series: Series = new Series();
        series.names.push(new Name(entry.media.title.romaji,'x-jap',NameType.OFFICIAL));
        series.names.push(new Name(entry.media.title.english,'unknown',NameType.MAIN));
        series.names.push(new Name(entry.media.title.native,'jap'));

        series.mediaType = await this.convertTypeToMediaType(entry.media.format);

        series.releaseYear = entry.media.startDate.year;

        var providerInfo: ListProviderLocalData = new ListProviderLocalData(AniListProvider.getInstance());
        providerInfo.targetSeason = await Name.getSeasonNumber(series.names);
        try {
            if (!providerInfo.targetSeason) {
                if (entry.media.relations.edges.findIndex(x => x.relationType == MediaRelation.PREQUEL) === -1) {
                    if (series.mediaType === MediaType.SPECIAL) {
                        providerInfo.targetSeason = 0;
                    } else {
                        providerInfo.targetSeason = 1;
                    }
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
        providerInfo.covers.push(new Cover(entry.media.coverImage.large, CoverSize.LARGE));
        providerInfo.covers.push(new Cover(entry.media.coverImage.medium, CoverSize.MEDIUM));
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
