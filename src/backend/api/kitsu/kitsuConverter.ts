import { Media } from './objects/searchResult';
import Series from '../../controller/objects/series';
import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';
import KitsuProvider from './kitsuProvider';
import { CoverSize } from '../../controller/objects/meta/CoverSize';
import Cover from '../../controller/objects/meta/Cover';

export default new class KitsuConverter {
    async convertMediaToAnime(media: Media): Promise<Series> {
        const series = new Series();

        series.runTime = media.episodeLength;
        series.names.engName = media.titles.en;
        series.names.mainName = media.titles.ja_jp;
        series.names.romajiName = media.titles.en_jp;
        series.names.otherNames.push(new Name(media.slug, 'slug'));
        series.names.otherNames.push(new Name(media.titles.en_us, 'en_us'));
        series.names.otherNames.push(new Name(media.canonicalTitle, 'canonicalTitle'));
        for (const title of media.abbreviatedTitles) {
            series.names.otherNames.push(new Name(title, 'abbreviatedTitles'));
        }
        series.names.fillNames();

        series.overviews.push(new Overview(media.synopsis, 'eng'));
        const providerInfos = new ListProviderLocalData(KitsuProvider.getInstance());

        if (media.coverImage) {
            providerInfos.covers.push(new Cover(media.coverImage.large, CoverSize.LARGE));
            providerInfos.covers.push(new Cover(media.coverImage.original, CoverSize.ORIGINAL));
            providerInfos.covers.push(new Cover(media.coverImage.small, CoverSize.SMALL));
            providerInfos.covers.push(new Cover(media.coverImage.tiny, CoverSize.TINY));
        } else if (media.posterImage) {
            providerInfos.covers.push(new Cover(media.posterImage.large, CoverSize.LARGE));
            providerInfos.covers.push(new Cover(media.posterImage.original, CoverSize.ORIGINAL));
            providerInfos.covers.push(new Cover(media.posterImage.small, CoverSize.SMALL));
            providerInfos.covers.push(new Cover(media.posterImage.tiny, CoverSize.TINY));
        }

        providerInfos.id = media.id;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;
        series.listProviderInfos.push(providerInfos);

        return series;
    }
}
