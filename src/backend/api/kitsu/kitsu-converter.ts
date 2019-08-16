import { Media } from './objects/searchResult';
import Series from '../../controller/objects/series';
import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import KitsuProvider from './kitsu-provider';

import Cover from '../../controller/objects/meta/cover';
import { NameType } from '../../controller/objects/meta/name-type';
import { MediaType } from '../../controller/objects/meta/media-type';
import Banner from '../../controller/objects/meta/banner';
import { ImageSize } from 'src/backend/controller/objects/meta/image-size';

export default new class KitsuConverter {
    async convertMediaToAnime(media: Media): Promise<Series> {
        const series = new Series();

        series.runTime = media.episodeLength;

        series.addSeriesName(new Name(media.titles.en, 'en'));
        series.addSeriesName(new Name(media.titles.en_us, 'en_us', NameType.OFFICIAL));
        series.addSeriesName(new Name(media.titles.ja_jp, 'jap'));

        series.addSeriesName(new Name(media.slug, 'slug', NameType.SLUG));
        series.addSeriesName(new Name(media.titles.en_us, 'en_us'));
        series.addSeriesName(new Name(media.canonicalTitle, 'canonicalTitle'));

        for (const title of media.abbreviatedTitles) {
            series.addSeriesName(new Name(title, 'abbreviatedTitles'));
        }

        series.overviews.push(new Overview(media.synopsis, 'eng'));
        series.releaseYear = new Date(media.startDate).getFullYear();
        series.mediaType = this.convertShowTypeToMediaType(media.showType);
        const providerInfos = new ListProviderLocalData(KitsuProvider.getInstance());

        providerInfos.covers.push(new Cover(media.posterImage.large, ImageSize.LARGE));
        providerInfos.covers.push(new Cover(media.posterImage.original, ImageSize.ORIGINAL));
        providerInfos.covers.push(new Cover(media.posterImage.small, ImageSize.SMALL));
        providerInfos.covers.push(new Cover(media.posterImage.tiny, ImageSize.TINY));

        providerInfos.banners.push(new Banner(media.coverImage.large, ImageSize.LARGE));
        providerInfos.banners.push(new Banner(media.coverImage.original, ImageSize.ORIGINAL));
        providerInfos.banners.push(new Banner(media.coverImage.small, ImageSize.SMALL));
        providerInfos.banners.push(new Banner(media.coverImage.tiny, ImageSize.TINY));

        providerInfos.id = media.id;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;
        providerInfos.lastExternalChange = new Date(media.updatedAt);
        series.addListProvider(providerInfos);

        return series;
    }

    convertShowTypeToMediaType(showType: string): MediaType {
        if (showType == "ONA") {
            return MediaType.SPECIAL;
        } else if (showType == "OVA") {
            return MediaType.SPECIAL;
        } else if (showType == "TV") {
            return MediaType.SERIES;
        } else if (showType == "movie") {
            return MediaType.MOVIE;
        } else if (showType == "music") {
            return MediaType.SPECIAL;
        } else if (showType == "special") {
            return MediaType.SPECIAL;
        }
        return MediaType.UNKOWN;
    }
}
