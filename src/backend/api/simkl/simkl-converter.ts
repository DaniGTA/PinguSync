import { Movie2, Show2, Anime } from './objects/userListResonse';
import Series from '../../controller/objects/series';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import SimklProvider from './simkl-provider';
import AniDBProvider from '../anidb/anidb-provider';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import { SimklTextSearchResults } from './objects/simklTextSearchResults';
import MultiProviderResult from '../multi-provider-result';
import Cover from '../../controller/objects/meta/cover';
import { ImageSize } from '../../controller/objects/meta/image-size';
import { MediaType } from '../../controller/objects/meta/media-type';

export default class SimklConverter {
    public async convertAnimeToSeries(anime: Anime): Promise<Series> {
        let series = new Series();
        let listProvider = new ListProviderLocalData(SimklProvider.instance);
        // - BEGINN - FILL META DATA
        listProvider.id = anime.show.ids.simkl;

        let aniDBListProvider = new InfoProviderLocalData(AniDBProvider.instance.providerName);

        aniDBListProvider.id = anime.show.ids.anidb;
        aniDBListProvider.fullInfo = false;

        listProvider.addSeriesName(new Name(anime.show.title, "unkown", NameType.UNKNOWN))


        // - END - 
        series.addListProvider(listProvider);
        return series;
    }
    public async convertShowsToSeries(show: Show2): Promise<Series> {
        let series = new Series();
        return series;
    }
    public async converMoviesToSeries(movie: Movie2): Promise<Series> {
        let series = new Series();
        return series;
    }

    public async convertSimklTextSearchResultsToMultiProviderResults(searchResults: SimklTextSearchResults[], mediaType: MediaType): Promise<MultiProviderResult[]> {
        const mprList: MultiProviderResult[] = [];
        for (const searchResult of searchResults) {
            const provider = new ListProviderLocalData(SimklProvider.instance.providerName);
            provider.id = searchResult.ids.simkl_id;
            provider.addSeriesName(new Name(searchResult.ids.slug, 'slug', NameType.SLUG));
            provider.addSeriesName(new Name(searchResult.title, 'en', NameType.MAIN));
            provider.releaseYear = searchResult.year;
            provider.covers.push(new Cover('https://simkl.net/posters/' + searchResult.poster, ImageSize.MEDIUM));
            provider.publicScore = searchResult.ratings.simkl.rating;
            provider.mediaType = mediaType;
            provider.fullInfo = false;
            mprList.push(new MultiProviderResult(provider));
        }
        return mprList;
    }
}
