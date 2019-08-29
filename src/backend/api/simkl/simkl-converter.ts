import { Movie2, Show2, Anime } from './objects/userListResonse';
import Series from 'src/backend/controller/objects/series';
import { ListProviderLocalData } from 'src/backend/controller/objects/list-provider-local-data';
import SimklProvider from './simkl-provider';
import AniDBProvider from '../anidb/anidb-provider';
import { InfoProviderLocalData } from 'src/backend/controller/objects/info-provider-local-data';
import Name from 'src/backend/controller/objects/meta/name';
import { NameType } from 'src/backend/controller/objects/meta/name-type';

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
}
