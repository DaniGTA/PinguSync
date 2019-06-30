import { Media } from './objects/searchResult';
import Anime from '../../../backend/controller/objects/anime';
import Name from '../../../backend/controller/objects/name';
import Overview from '../../../backend/controller/objects/overview';
import { ProviderInfo } from '../../../backend/controller/objects/providerInfo';
import KitsuProvider from './kitsuProvider';

export default new class KitsuConverter {
    async convertMediaToAnime(media: Media): Promise<Anime> {
        const anime = new Anime();
        if (media.coverImage != null) {
            anime.coverImage = media.coverImage.large;
        } else {
            anime.coverImage = media.posterImage.large;
        }

        anime.runTime = media.episodeLength;
        anime.names.engName = media.titles.en;
        anime.names.mainName = media.titles.ja_jp;
        anime.names.romajiName = media.titles.en_jp;
        anime.names.otherNames.push(new Name(media.slug, 'slug'));
        anime.names.otherNames.push(new Name(media.titles.en_us, 'en_us'));
        anime.names.otherNames.push(new Name(media.canonicalTitle, 'canonicalTitle'));
        for (const title of media.abbreviatedTitles) {
            anime.names.otherNames.push(new Name(title, 'abbreviatedTitles'));
        }
        anime.names.fillNames();

        anime.overviews.push(new Overview(media.synopsis, 'eng'));
        const providerInfos = new ProviderInfo(KitsuProvider.getInstance());
        providerInfos.id = media.id;
        providerInfos.publicScore = media.ratingRank;
        providerInfos.rawEntry = media;
        providerInfos.episodes = media.episodeCount;
        anime.providerInfos.push(providerInfos);

        return anime;
    }
}