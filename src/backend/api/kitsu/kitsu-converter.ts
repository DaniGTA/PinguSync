import { Media } from './objects/searchResult';
import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import KitsuProvider from './kitsu-provider';

import Cover from '../../controller/objects/meta/cover';
import { NameType } from '../../controller/objects/meta/name-type';
import { MediaType } from '../../controller/objects/meta/media-type';
import Banner from '../../controller/objects/meta/banner';
import { ImageSize } from '../../controller/objects/meta/image-size';

export default new class KitsuConverter {
    async convertMediaToAnime(media: Media): Promise<ListProviderLocalData> {
        const providerInfos = new ListProviderLocalData(KitsuProvider.getInstance());

        providerInfos.addSeriesName(new Name(media.titles.en, 'en'));
        providerInfos.addSeriesName(new Name(media.titles.en_us, 'en_us', NameType.OFFICIAL));
        providerInfos.addSeriesName(new Name(media.titles.ja_jp, 'jap'));

        providerInfos.addSeriesName(new Name(media.slug, 'slug', NameType.SLUG));
        providerInfos.addSeriesName(new Name(media.titles.en_us, 'en_us'));
        providerInfos.addSeriesName(new Name(media.canonicalTitle, 'canonicalTitle'));

        providerInfos.addOverview(new Overview(media.synopsis, 'eng'));

        providerInfos.releaseYear = new Date(media.startDate).getFullYear();
        providerInfos.runTime = media.episodeLength;
        providerInfos.mediaType = this.convertShowTypeToMediaType(media.showType);
        try {
            providerInfos.covers.push(new Cover(media.posterImage.original, ImageSize.ORIGINAL));
            providerInfos.covers.push(new Cover(media.posterImage.tiny, ImageSize.TINY));
            providerInfos.covers.push(new Cover(media.posterImage.small, ImageSize.SMALL));
            providerInfos.covers.push(new Cover(media.posterImage.large, ImageSize.LARGE));
        } catch (err) { }

        try {
            providerInfos.banners.push(new Banner(media.coverImage.original, ImageSize.ORIGINAL));
            providerInfos.banners.push(new Banner(media.coverImage.tiny, ImageSize.TINY));
            providerInfos.banners.push(new Banner(media.coverImage.small, ImageSize.SMALL));
            providerInfos.banners.push(new Banner(media.coverImage.large, ImageSize.LARGE));
        } catch (err) { }

        providerInfos.id = media.id;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;
        providerInfos.lastExternalChange = new Date(media.updatedAt);

        return providerInfos;
    }

    convertShowTypeToMediaType(showType: string): MediaType {
        if (showType == "ONA") {
            return MediaType.SPECIAL;
        } else if (showType == "OVA") {
            return MediaType.SPECIAL;
        } else if (showType == "TV") {
            return MediaType.ANIME;
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
