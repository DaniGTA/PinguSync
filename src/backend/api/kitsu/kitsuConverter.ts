import { Media } from './objects/searchResult';
import Series from '../../controller/objects/series';
import Name from '../../../backend/controller/objects/name';
import Overview from '../../../backend/controller/objects/overview';
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';
import KitsuProvider from './kitsuProvider';

export default new class KitsuConverter {
    async convertMediaToAnime(media: Media): Promise<Series> {
        const series = new Series();
        if (media.coverImage != null) {
            series.coverImage = media.coverImage.large;
        } else {
            series.coverImage = media.posterImage.large;
        }

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
        providerInfos.id = media.id;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;
        series.listProviderInfos.push(providerInfos);

        return series;
    }
}
