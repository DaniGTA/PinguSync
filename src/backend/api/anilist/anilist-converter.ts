import Series, { WatchStatus } from '../../controller/objects/series';
import { Medium } from './graphql/searchSeries';
import { GetSeriesByID } from './graphql/getSeriesByID';
import Overview from '../../controller/objects/meta/overview';
import Name from '../../controller/objects/meta/name';
import { Entry, MediaRelation } from './graphql/seriesList';
import AniListProvider from './anilist-provider';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Cover from '../../controller/objects/meta/cover';
import { ImageSize } from '../../controller/objects/meta/image-size';
import { MediaType } from '../../controller/objects/meta/media-type';
import { MediaFormat } from './graphql/mediaFormat';
import { NameType } from '../../controller/objects/meta/name-type';
import Banner from '../../controller/objects/meta/banner';

export default new class AniListConverter {
    public async convertMediaToAnime(medium: Medium): Promise<Series> {
        const series = new Series();
        series.episodes = medium.episodes;
        series.addSeriesName(new Name(medium.title.romaji, 'x-jap', NameType.OFFICIAL));
        series.addSeriesName(new Name(medium.title.english, 'unknown', NameType.MAIN));
        series.addSeriesName(new Name(medium.title.native, 'jap'));
        series.releaseYear = medium.startDate.year;
        series.mediaType = await this.convertTypeToMediaType(medium.format);

        const provider = new ListProviderLocalData(AniListProvider.getInstance());
        provider.covers.push(new Cover(medium.coverImage.large, ImageSize.LARGE));
        provider.covers.push(new Cover(medium.coverImage.medium, ImageSize.MEDIUM));

        provider.banners.push(new Banner(medium.bannerImage, ImageSize.LARGE));

        provider.id = medium.id;
        provider.score = medium.averageScore;
        provider.episodes = medium.episodes;
        await series.addListProvider(provider);
        return series;
    }

    private async convertTypeToMediaType(type: MediaFormat): Promise<MediaType> {
        if (type == MediaFormat.MOVIE) {
            return MediaType.MOVIE;
        } else if (type == MediaFormat.TV || type == MediaFormat.TV_SHORT) {
            return MediaType.SERIES;
        } else if (type == MediaFormat.SPECIAL || MediaFormat.OVA || MediaFormat.ONA) {
            return MediaType.SPECIAL;
        }
        return MediaType.UNKOWN;
    }

    public async convertExtendedInfoToAnime(info: GetSeriesByID): Promise<Series> {
        const series = new Series();

        series.addOverview(new Overview(info.Media.description, 'eng'));
        series.episodes = info.Media.episodes;
        series.releaseYear = info.Media.startDate.year;
        series.addSeriesName(new Name(info.Media.title.romaji, 'x-jap', NameType.OFFICIAL));
        series.addSeriesName(new Name(info.Media.title.english, 'unknown', NameType.MAIN));
        series.addSeriesName(new Name(info.Media.title.native, 'jap'));
        series.addSeriesName(new Name(info.Media.title.userPreferred, 'userPreferred'));
        series.mediaType = await this.convertTypeToMediaType(info.Media.format);

        const provider = new ListProviderLocalData(AniListProvider.getInstance());
        provider.covers.push(new Cover(info.Media.coverImage.large, ImageSize.LARGE));
        provider.covers.push(new Cover(info.Media.coverImage.medium, ImageSize.MEDIUM));

        provider.banners.push(new Banner(info.Media.bannerImage, ImageSize.LARGE));

        provider.id = info.Media.id;
        provider.score = info.Media.averageScore;
        provider.episodes = info.Media.episodes;
        await series.addListProvider(provider);
        return series;
    }

    public async convertListEntryToAnime(entry: Entry, watchStatus: WatchStatus): Promise<Series> {
        var series: Series = new Series();
        series.addSeriesName(new Name(entry.media.title.romaji, 'x-jap', NameType.OFFICIAL));
        series.addSeriesName(new Name(entry.media.title.english, 'unknown', NameType.MAIN));
        series.addSeriesName(new Name(entry.media.title.native, 'jap'));

        series.mediaType = await this.convertTypeToMediaType(entry.media.format);

        series.releaseYear = entry.media.startDate.year;

        var providerInfo: ListProviderLocalData = new ListProviderLocalData(AniListProvider.getInstance());
        providerInfo.targetSeason = await Name.getSeasonNumber(await series.getAllNames());
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
                providerInfo.prequelIds.push(entry.media.relations.nodes[prequel].id);
            }
            let sequel = entry.media.relations.edges.findIndex(x => x.relationType === MediaRelation.SEQUEL);
            if (sequel != -1) {
                providerInfo.sequelIds.push(entry.media.relations.nodes[sequel].id);
            }
        } catch (err) {
            console.error(err);
        }
        providerInfo.id = entry.media.id;
        providerInfo.score = entry.score;
        providerInfo.rawEntry = entry;
        providerInfo.covers.push(new Cover(entry.media.coverImage.large, ImageSize.LARGE));
        providerInfo.covers.push(new Cover(entry.media.coverImage.medium, ImageSize.MEDIUM));

        providerInfo.banners.push(new Banner(entry.media.bannerImage, ImageSize.LARGE));
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

        await series.addListProvider(providerInfo);
        return series;
    }
}
