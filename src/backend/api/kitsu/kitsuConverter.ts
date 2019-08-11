import { Media } from './objects/searchResult';
import Series from '../../controller/objects/series';
import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';
import KitsuProvider from './kitsuProvider';
import { CoverSize } from '../../controller/objects/meta/CoverSize';
import Cover from '../../controller/objects/meta/Cover';
import { NameType } from '../../controller/objects/meta/nameType';
import { MediaType } from '../../controller/objects/meta/mediaType';

export default new class KitsuConverter {
    async convertMediaToAnime(media: Media): Promise<Series> {
        const series = new Series();

        series.runTime = media.episodeLength;

        series.addSeriesName(new Name(media.titles.en, 'en'));
        series.addSeriesName(new Name(media.titles.en_us, 'en_us',NameType.OFFICIAL));
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

        if (media.posterImage) {
            providerInfos.covers.push(new Cover(media.posterImage.large, CoverSize.LARGE));
            providerInfos.covers.push(new Cover(media.posterImage.original, CoverSize.ORIGINAL));
            providerInfos.covers.push(new Cover(media.posterImage.small, CoverSize.SMALL));
            providerInfos.covers.push(new Cover(media.posterImage.tiny, CoverSize.TINY));
        } else if (media.coverImage) {
            providerInfos.covers.push(new Cover(media.coverImage.large, CoverSize.LARGE));
            providerInfos.covers.push(new Cover(media.coverImage.original, CoverSize.ORIGINAL));
            providerInfos.covers.push(new Cover(media.coverImage.small, CoverSize.SMALL));
            providerInfos.covers.push(new Cover(media.coverImage.tiny, CoverSize.TINY));
        }

        providerInfos.id = media.id;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;
        providerInfos.lastExternalChange = new Date(media.updatedAt);
        series.addListProvider(providerInfos);

        return series;
    }

    convertShowTypeToMediaType(showType: string):MediaType{
        if(showType == "ONA"){
            return MediaType.SPECIAL;
        }else if(showType == "OVA"){
            return MediaType.SPECIAL;
        }else if(showType == "TV"){
            return MediaType.SERIES;
        }else if(showType == "movie"){
            return MediaType.MOVIE;
        }else if(showType == "music"){
            return MediaType.SPECIAL;
        }else if(showType == "special"){
            return MediaType.SPECIAL;
        }
        return MediaType.UNKOWN;
    }
}
