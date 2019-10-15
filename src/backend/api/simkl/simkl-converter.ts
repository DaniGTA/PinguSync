import Cover from '../../controller/objects/meta/cover';
import Genre from '../../controller/objects/meta/genre';
import { ImageSize } from '../../controller/objects/meta/image-size';
import { MediaType } from '../../controller/objects/meta/media-type';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import Overview from '../../controller/objects/meta/overview';
import Series from '../../controller/objects/series';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import { StreamingProviderLocalData } from '../../controller/provider-manager/local-data/streaming-provider-local-data';
import AniDBProvider from '../anidb/anidb-provider';
import MalProvider from '../mal/mal-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import TVDBProvider from '../tvdb/tvdb-provider';
import { ISimklFullInfoAnimeResponse, ISimklFullInfoIDS } from './objects/simklFullInfoAnimeResponse';
import { IMovieIDS, ISimklFullInfoMovieResponse } from './objects/simklFullInfoMovieResponse';
import { ISeriesIDS, ISimklFullInfoSeriesResponse } from './objects/simklFullInfoSeriesResponse';
import { ISimklTextSearchResults } from './objects/simklTextSearchResults';
import { Anime, Movie2, Show2 } from './objects/userListResonse';
import SimklProvider from './simkl-provider';

export default class SimklConverter {
    public async convertAnimeToSeries(anime: Anime): Promise<Series> {
        const series = new Series();
        const listProvider = new ListProviderLocalData(anime.show.ids.simkl, SimklProvider.instance);
        // - BEGINN - FILL META DATA
        const aniDBListProvider = new InfoProviderLocalData(anime.show.ids.anidb, AniDBProvider);

        listProvider.addSeriesName(new Name(anime.show.title, 'unkown', NameType.UNKNOWN));


        // - END -
        series.addProviderDatas(aniDBListProvider);
        series.addListProvider(listProvider);
        return series;
    }
    public async convertShowsToSeries(show: Show2): Promise<Series> {
        const series = new Series();
        return series;
    }
    public async converMoviesToSeries(movie: Movie2): Promise<Series> {
        const series = new Series();
        return series;
    }

    public async convertSimklTextSearchResultsToMultiProviderResults(searchResults: ISimklTextSearchResults[], type: MediaType): Promise<MultiProviderResult[]> {
        const mprList: MultiProviderResult[] = [];
        for (const searchResult of searchResults) {
            const provider = new ListProviderLocalData(searchResult.ids.simkl_id, SimklProvider.instance);
            provider.addSeriesName(new Name(searchResult.ids.slug, 'slug', NameType.SLUG));
            provider.addSeriesName(new Name(searchResult.title, 'en', NameType.MAIN));
            provider.releaseYear = searchResult.year;
            provider.covers.push(new Cover('https://simkl.net/posters/' + searchResult.poster, ImageSize.MEDIUM));
            provider.publicScore = searchResult.ratings.simkl.rating;
            provider.mediaType = type;
            provider.hasFullInfo = false;
            provider.rawEntry = searchResult;
            mprList.push(new MultiProviderResult(provider));
        }
        return mprList;
    }

    public async convertFullAnimeInfoToProviderLocalData(response: ISimklFullInfoAnimeResponse): Promise<MultiProviderResult> {

        const provider = new ListProviderLocalData(response.ids.simkl, SimklProvider.instance);
        provider.mediaType = await this.convertAnimeTypeToMediaType(response.anime_type);
        provider.hasFullInfo = true;
        provider.country = response.country;
        provider.covers = await this.convertPosterIdToCover(response.poster);
        provider.genres = await this.convertSimklGenresToGenres(response.genres);
        provider.episodes = response.total_episodes;
        provider.publicScore = response.ratings.simkl.rating;
        provider.rawEntry = response;
        provider.releaseYear = response.year;
        provider.addOverview(new Overview(response.overview, 'en'));
        provider.addSeriesName(new Name(response.title, 'unkown', NameType.MAIN));
        if (response.en_title) {
            provider.addSeriesName(new Name(response.en_title, 'en', NameType.OFFICIAL));
        }
        const mprList = new MultiProviderResult(provider, ...await this.convertAnimeIdsToProviders(response.ids));
        return mprList;
    }

    public async convertFullMovieInfoToProviderLocalData(response: ISimklFullInfoMovieResponse): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(response.ids.simkl, SimklProvider.instance);
        provider.mediaType = MediaType.MOVIE;
        provider.country = response.country;
        provider.hasFullInfo = true;
        provider.covers = await this.convertPosterIdToCover(response.poster);
        provider.genres = await this.convertSimklGenresToGenres(response.genres);
        provider.publicScore = response.ratings.simkl.rating;
        provider.rawEntry = response;
        provider.releaseYear = response.year;
        provider.addOverview(new Overview(response.overview, 'en'));
        provider.addSeriesName(new Name(response.title, 'unkown', NameType.MAIN));
        const mprList = new MultiProviderResult(provider, ...await this.convertMovieIdsToProviders(response.ids));
        return mprList;
    }
    public async convertFullSeriesInfoToProviderLocalData(response: ISimklFullInfoSeriesResponse): Promise<MultiProviderResult> {

        const provider = new ListProviderLocalData(response.ids.simkl, SimklProvider.instance);
        provider.mediaType = MediaType.SERIES;
        provider.country = response.country;
        provider.hasFullInfo = true;
        provider.covers = await this.convertPosterIdToCover(response.poster);
        provider.genres = await this.convertSimklGenresToGenres(response.genres);
        provider.episodes = response.total_episodes;
        provider.publicScore = response.ratings.simkl.rating;
        provider.rawEntry = response;
        provider.releaseYear = response.year;
        provider.addOverview(new Overview(response.overview, 'en'));
        provider.addSeriesName(new Name(response.title, 'unkown', NameType.MAIN));
        const mprList = new MultiProviderResult(provider, ...await this.convertSerieIdsToProviders(response.ids));

        return mprList;
    }
    private async convertSerieIdsToProviders(serieIds: ISeriesIDS): Promise<ProviderLocalData[]> {
        const providers: ProviderLocalData[] = [];
        if (serieIds.imdb) {
            providers.push(new InfoProviderLocalData(serieIds.imdb, 'imdb'));
        }
        if (serieIds.tvdb) {
            providers.push(new InfoProviderLocalData(TVDBProvider.Instance.providerName, serieIds.tvdb));
        }
        if (serieIds.zap2it) {
            providers.push(new InfoProviderLocalData(serieIds.tvdb, 'zap2it'));
        }

        return providers;
    }

    private async convertMovieIdsToProviders(animeIds: IMovieIDS): Promise<ProviderLocalData[]> {
        const providers: ProviderLocalData[] = [];
        return providers;
    }

    private async convertAnimeIdsToProviders(animeIds: ISimklFullInfoIDS): Promise<ProviderLocalData[]> {
        const providers: ProviderLocalData[] = [];
        if (animeIds.allcin) {
            providers.push(new InfoProviderLocalData(animeIds.allcin, 'allcin'));
        }
        if (animeIds.anfo) {
            providers.push(new InfoProviderLocalData(animeIds.anfo, 'anfo'));
        }
        if (animeIds.anidb) {
            providers.push(new InfoProviderLocalData(animeIds.anidb, AniDBProvider.instance));
        }
        if (animeIds.ann) {
            providers.push(new InfoProviderLocalData(animeIds.ann, 'ann'));
        }
        if (animeIds.mal) {
            providers.push(new ListProviderLocalData(animeIds.mal, MalProvider.getInstance()));
        }
        if (animeIds.crunchyroll) {
            providers.push(new StreamingProviderLocalData(animeIds.crunchyroll, 'crunchyroll'));
        }
        if (animeIds.imdb) {
            providers.push(new InfoProviderLocalData(animeIds.imdb, 'imdb'));
        }
        if (animeIds.wikien) {
            providers.push(new InfoProviderLocalData(animeIds.wikien, 'wikien'));
        }
        return providers;
    }

    private async convertSimklGenresToGenres(simklGenres: string[]): Promise<Genre[]> {
        const genres = [];
        if (simklGenres && Array.isArray(simklGenres)) {
            for (const simklGenre of simklGenres) {
                genres.push(new Genre(simklGenre));
            }
        }
        return genres;
    }

    private async convertPosterIdToCover(posterId: string): Promise<Cover[]> {
        const covers: Cover[] = [];
        if (posterId) {
            covers.push(new Cover('https://simkl.net/posters/' + posterId + '_m.webp', ImageSize.MAX));
            covers.push(new Cover('https://simkl.net/posters/' + posterId + '_ca.webp', ImageSize.MEDIUM));
            covers.push(new Cover('https://simkl.net/posters/' + posterId + '_c.webp', ImageSize.SMALL));
            covers.push(new Cover('https://simkl.net/posters/' + posterId + '_cm.webp', ImageSize.TINY));
            covers.push(new Cover('https://simkl.net/posters/' + posterId + '_s.webp', ImageSize.VERYTINY));
        }
        return covers;
    }

    private async convertAnimeTypeToMediaType(animeType: string): Promise<MediaType> {
        switch (animeType) {
            case 'tv':
                return MediaType.ANIME;
            case 'special':
                return MediaType.SPECIAL;
            case 'ova':
                return MediaType.OVA;
            case 'movie':
                return MediaType.MOVIE;
        }
        return MediaType.ANIME;
    }
}
