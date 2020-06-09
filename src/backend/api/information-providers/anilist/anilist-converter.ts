import Banner from '../../../controller/objects/meta/banner';
import Cover from '../../../controller/objects/meta/cover';
import { ImageSize } from '../../../controller/objects/meta/image-size';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import { NameType } from '../../../controller/objects/meta/name-type';
import Overview from '../../../controller/objects/meta/overview';
import Season from '../../../controller/objects/meta/season';
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import listHelper from '../../../helpFunctions/list-helper';
import ProviderLocalDataWithSeasonInfo from '../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import logger from '../../../logger/logger';
import MultiProviderResult from '../../provider/multi-provider-result';
import AniListProvider from './anilist-provider';
import { GetSeriesByID } from './graphql/getSeriesByID';
import { MediaFormat } from './graphql/mediaFormat';
import { Medium } from './graphql/searchSeries';
import { Entry, MediaRelation, Relation } from './graphql/seriesList';
import { GetUserSeriesListInfo } from './graphql/getUserSeriesList';
import ProviderUserList from '../../../controller/objects/provider-user-list';
import { ListType } from '../../../controller/settings/models/provider/list-types';

export default new class AniListConverter {

    public convertUserSeriesListToProviderList(rawData: GetUserSeriesListInfo): ProviderUserList[] {
        const allProviderUserList: ProviderUserList[] = [];
        for (const entry of rawData.MediaListCollection.lists) {
            const pul = new ProviderUserList(entry.name, this.convertStatusToUserListType(entry.status));
            pul.custom = entry.isCustomList;
            allProviderUserList.push(pul);
        }
        return allProviderUserList;
    }

    public convertStatusToUserListType(status: string): ListType {
        switch (status) {
            case 'PAUSED':
                return ListType.PAUSED;
            case 'DROPPED':
                return ListType.DROPPED;
            case 'COMPLETED':
                return ListType.COMPLETED;
            case 'CURRENT':
                return ListType.CURRENT;
            default:
                return ListType.UNKOWN;
        }
    }

    public async convertMediaToLocalData(medium: Medium): Promise<ListProviderLocalData> {
        let provider = new ListProviderLocalData(medium.id, AniListProvider.getInstance());

        if (medium.title.romaji) {
            provider.addSeriesName(new Name(medium.title.romaji, 'x-jap', NameType.OFFICIAL));
        }
        if (medium.title.english) {
            provider.addSeriesName(new Name(medium.title.english, 'unknown', NameType.MAIN));
        }
        if (medium.title.native) {
            provider.addSeriesName(new Name(medium.title.native, 'jap'));
        }
        provider.mediaType = this.convertTypeToMediaType(medium.format);
        provider.covers.push(new Cover(medium.coverImage.large, ImageSize.LARGE));
        provider.covers.push(new Cover(medium.coverImage.medium, ImageSize.MEDIUM));
        provider.releaseYear = medium.startDate.year;
        provider.banners.push(new Banner(medium.bannerImage, ImageSize.LARGE));
        provider.rawEntry = medium;
        provider.infoStatus = ProviderInfoStatus.BASIC_INFO;

        provider.score = medium.averageScore;
        provider.episodes = medium.episodes;
        provider = await this.fillRelation(provider, medium.relations);
        return provider;
    }

    public async convertExtendedInfoToAnime(info: GetSeriesByID): Promise<ListProviderLocalData> {
        let provider = new ListProviderLocalData(info.Media.id, AniListProvider.getInstance());
        provider.addOverview(new Overview(info.Media.description, 'eng'));

        if (info.Media.title.romaji) {
            provider.addSeriesName(new Name(info.Media.title.romaji, 'x-jap', NameType.OFFICIAL));
        }
        if (info.Media.title.english) {
            provider.addSeriesName(new Name(info.Media.title.english, 'unknown', NameType.MAIN));
        }
        if (info.Media.title.native) {
            provider.addSeriesName(new Name(info.Media.title.native, 'jap'));
        }
        provider.addSeriesName(new Name(info.Media.title.userPreferred, 'userPreferred'));
        provider.mediaType = this.convertTypeToMediaType(info.Media.format);
        provider.covers.push(new Cover(info.Media.coverImage.large, ImageSize.LARGE));
        provider.covers.push(new Cover(info.Media.coverImage.medium, ImageSize.MEDIUM));
        provider.releaseYear = info.Media.startDate.year;
        provider.banners.push(new Banner(info.Media.bannerImage, ImageSize.LARGE));
        provider.rawEntry = info;
        provider.score = info.Media.averageScore;
        provider.episodes = info.Media.episodes;
        provider.infoStatus = ProviderInfoStatus.FULL_INFO;
        provider = await this.fillRelation(provider, info.Media.relations);
        return provider;
    }

    public async convertListEntryToAnime(entry: Entry, watchStatus: ListType): Promise<MultiProviderResult> {
        let seasonNumber: number | undefined;
        let providerInfo: ListProviderLocalData = new ListProviderLocalData(entry.media.id, AniListProvider.getInstance());
        if (entry.media.title.romaji) {
            providerInfo.addSeriesName(new Name(entry.media.title.romaji, 'x-jap', NameType.OFFICIAL));
        }
        if (entry.media.title.english) {
            providerInfo.addSeriesName(new Name(entry.media.title.english, 'unknown', NameType.MAIN));
        }
        if (entry.media.title.native) {
            providerInfo.addSeriesName(new Name(entry.media.title.native, 'jap'));
        }
        providerInfo.releaseYear = entry.media.startDate.year;
        providerInfo.mediaType = this.convertTypeToMediaType(entry.media.format);

        try {
            if (entry.media.relations.edges.findIndex((x) => x.relationType === MediaRelation.PREQUEL) === -1) {
                if (providerInfo.mediaType === MediaType.SPECIAL) {
                    seasonNumber = 0;
                } else {
                    seasonNumber = 1;
                }
            }
            providerInfo = await this.fillRelation(providerInfo, entry.media.relations);

        } catch (err) {
            logger.error(err);
        }
        providerInfo.score = entry.score;
        providerInfo.rawEntry = entry;
        providerInfo.covers.push(new Cover(entry.media.coverImage.large, ImageSize.LARGE));
        providerInfo.covers.push(new Cover(entry.media.coverImage.medium, ImageSize.MEDIUM));

        providerInfo.banners.push(new Banner(entry.media.bannerImage, ImageSize.LARGE));
        if (entry.progress !== 0) {
            for (let index = 0; index < entry.progress; index++) {
                //providerInfo.addOneWatchedEpisode(index + 1);
            }
        }

        providerInfo.watchStatus = watchStatus;
        providerInfo.lastExternalChange = new Date(entry.updatedAt);
        providerInfo.infoStatus = ProviderInfoStatus.BASIC_INFO;
        if (typeof entry.media.episodes !== 'undefined') {
            providerInfo.episodes = entry.media.episodes;
        }
        return new MultiProviderResult(new ProviderLocalDataWithSeasonInfo(providerInfo, new Season(seasonNumber)));
    }

    private convertTypeToMediaType(type: MediaFormat): MediaType {
        if (type === MediaFormat.MOVIE) {
            return MediaType.MOVIE;
        } else if (type === MediaFormat.TV || type === MediaFormat.TV_SHORT) {
            return MediaType.ANIME;
        } else if (type === MediaFormat.SPECIAL || MediaFormat.OVA || MediaFormat.ONA) {
            return MediaType.SPECIAL;
        }
        return MediaType.UNKOWN;
    }

    private async fillRelation(providerInfo: ListProviderLocalData, relations: Relation): Promise<ListProviderLocalData> {
        const prequel = relations.edges.findIndex((x) => x.relationType === MediaRelation.PREQUEL);
        if (prequel !== -1) {
            providerInfo.prequelIds.push(relations.nodes[prequel].id);
        }
        const sequel = relations.edges.findIndex((x) => x.relationType === MediaRelation.SEQUEL);
        if (sequel !== -1) {
            providerInfo.sequelIds.push(relations.nodes[sequel].id);
        }
        const alternatives = listHelper.findAllIndexes(relations.edges, (item) => item.relationType === MediaRelation.ALTERNATIVE);
        if (alternatives.length !== 0) {
            for (const index of alternatives) {
                providerInfo.alternativeIds.push(relations.nodes[index].id);
            }
        }
        return providerInfo;
    }
}();
