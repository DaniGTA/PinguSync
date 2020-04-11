import Cover from '../../../controller/objects/meta/cover';
import Episode from '../../../controller/objects/meta/episode/episode';
import EpisodeThumbnail from '../../../controller/objects/meta/episode/episode-thumbnail';
import EpisodeTitle from '../../../controller/objects/meta/episode/episode-title';
import { EpisodeType } from '../../../controller/objects/meta/episode/episode-type';
import Genre from '../../../controller/objects/meta/genre';
import { ImageSize } from '../../../controller/objects/meta/image-size';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import { NameType } from '../../../controller/objects/meta/name-type';
import Overview from '../../../controller/objects/meta/overview';
import Series from '../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import { StreamingProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/streaming-provider-local-data';
import ProviderLocalDataWithSeasonInfo from '../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import logger from '../../../logger/logger';
import MultiProviderResult from '../../provider/multi-provider-result';
import AniDBProvider from '../anidb/anidb-provider';
import MalProvider from '../mal/mal-provider';
import TVDBProvider from '../tvdb/tvdb-provider';
import { ISimklEpisodeInfo } from './objects/simklEpisodeInfo';
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
            provider.infoStatus = ProviderInfoStatus.BASIC_INFO;
            provider.rawEntry = searchResult;
            mprList.push(new MultiProviderResult(new ProviderLocalDataWithSeasonInfo(provider)));
        }
        return mprList;
    }

    public async convertFullAnimeInfoToProviderLocalData(response: ISimklFullInfoAnimeResponse, episodeResponse: ISimklEpisodeInfo[]): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(response.ids.simkl, SimklProvider.instance);
        provider.mediaType = this.convertAnimeTypeToMediaType(response.anime_type);
        provider.infoStatus = ProviderInfoStatus.FULL_INFO;
        provider.country = response.country;
        provider.covers = this.convertPosterIdToCover(response.poster);
        provider.genres = this.convertSimklGenresToGenres(response.genres);
        provider.episodes = response.total_episodes;
        provider.publicScore = response.ratings.simkl.rating;
        provider.rawEntry = response;
        provider.releaseYear = response.year;
        provider.addOverview(new Overview(response.overview, 'en'));
        provider.addSeriesName(new Name(response.title, 'unkown', NameType.MAIN));
        provider.addDetailedEpisodeInfos(...this.convertSimklEpisodesToDetailedEpisodes(episodeResponse));
        if (response.en_title) {
            provider.addSeriesName(new Name(response.en_title, 'en', NameType.OFFICIAL));
        }
        const mprList = new MultiProviderResult(new ProviderLocalDataWithSeasonInfo(provider), ...this.convertAnimeIdsToProviders(response.ids));
        return mprList;
    }

    public async convertFullMovieInfoToProviderLocalData(response: ISimklFullInfoMovieResponse): Promise<MultiProviderResult> {
        const provider = new ListProviderLocalData(response.ids.simkl, SimklProvider.instance);
        provider.mediaType = MediaType.MOVIE;
        provider.country = response.country;
        provider.infoStatus = ProviderInfoStatus.FULL_INFO;
        provider.covers = this.convertPosterIdToCover(response.poster);
        provider.genres = this.convertSimklGenresToGenres(response.genres);
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
        provider.infoStatus = ProviderInfoStatus.FULL_INFO;
        provider.covers = this.convertPosterIdToCover(response.poster);
        provider.genres = this.convertSimklGenresToGenres(response.genres);
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
            providers.push(new InfoProviderLocalData(serieIds.tvdb, TVDBProvider));
        }
        if (serieIds.zap2it) {
            providers.push(new InfoProviderLocalData(serieIds.zap2it, 'zap2it'));
        }

        return providers;
    }
    private async convertMovieIdsToProviders(animeIds: IMovieIDS): Promise<ProviderLocalData[]> {

        const providers: ProviderLocalData[] = [];
        return providers;
    }

    private convertSimklEpisodesToDetailedEpisodes(episodeResponse: ISimklEpisodeInfo[]): Episode[] {
        const result: Episode[] = [];
        for (const simklEpisode of episodeResponse) {
            result.push(this.convertSimklEpisodeToDetailedEpisode(simklEpisode));
        }
        return result;
    }

    private convertSimklEpisodeToDetailedEpisode(simklEpisode: ISimklEpisodeInfo): Episode {
        const episode = new Episode(simklEpisode.episode ?? '');
        if (simklEpisode.title) {
            const episodeTitle = new EpisodeTitle(simklEpisode.title, 'en');
            episode.title.push(episodeTitle);
        }
        if (simklEpisode.description) {
            episode.summery = simklEpisode.description;
        }
        episode.thumbnails.push(...this.convertSimklEpisodeImgToEpisodeThumbnail(simklEpisode));
        episode.providerEpisodeId = simklEpisode.ids.simkl_id;
        episode.type = this.convertSimklEpisodeTypeToEpisodeType(simklEpisode);
        episode.airDate = new Date(simklEpisode.date);
        return episode;
    }

    private convertSimklEpisodeTypeToEpisodeType(simklEpisode: ISimklEpisodeInfo): EpisodeType {
        if (simklEpisode.type === 'episode') {
            return EpisodeType.REGULAR_EPISODE;
        } else if (simklEpisode.type === 'special') {
            return EpisodeType.SPECIAL;
        } else {
            logger.warn('[SIMKL CONVERTER] Cant convert simkl episode type ' + simklEpisode.type + ' to EpisodeType');
            return EpisodeType.UNKOWN;
        }
    }

    /**
     * img size can be: 600x338 on _w or 210x118 on _c or 112x63 on _m
     * img Format can be: .jpg or .webp
     * @param simklEpisode a single simkl episode
     * @returns 3 sizes of the same episode thumbnail or 0 if the episode dont have a thumbnail.
     */
    private convertSimklEpisodeImgToEpisodeThumbnail(simklEpisode: ISimklEpisodeInfo): EpisodeThumbnail[] {
        if (simklEpisode.img) {
            const url = 'https://simkl.in/episodes/';
            const largeImgSize = '_w'; // 600x338
            const mediumImgSize = '_c'; // 210x118
            const smallImgSize = '_m'; // 112x63
            const imgFormat = '.jpg';
            const large = new EpisodeThumbnail(url + simklEpisode.img + largeImgSize + imgFormat, ImageSize.LARGE);
            const medium = new EpisodeThumbnail(url + simklEpisode.img + mediumImgSize + imgFormat, ImageSize.MEDIUM);
            const small = new EpisodeThumbnail(url + simklEpisode.img + smallImgSize + imgFormat, ImageSize.SMALL);
            return [large, medium, small];
        }
        return [];
    }


    private convertAnimeIdsToProviders(animeIds: ISimklFullInfoIDS): ProviderLocalDataWithSeasonInfo[] {
        const providers: ProviderLocalData[] = [];
        if (animeIds.allcin) {
            providers.push(new InfoProviderLocalData(animeIds.allcin, 'allcin'));
        }
        if (animeIds.anfo) {
            providers.push(new InfoProviderLocalData(animeIds.anfo, 'anfo'));
        }
        if (animeIds.anidb) {
            providers.push(new InfoProviderLocalData(animeIds.anidb, AniDBProvider));
        }
        if (animeIds.ann) {
            providers.push(new InfoProviderLocalData(animeIds.ann, 'ann'));
        }
        if (animeIds.mal) {
            providers.push(new ListProviderLocalData(animeIds.mal, MalProvider));
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
        const result: ProviderLocalDataWithSeasonInfo[] = [];
        for (const iterator of providers) {
            result.push(new ProviderLocalDataWithSeasonInfo(iterator));
        }
        return result;
    }

    private convertSimklGenresToGenres(simklGenres: string[]): Genre[] {
        const genres = [];
        if (simklGenres && Array.isArray(simklGenres)) {
            for (const simklGenre of simklGenres) {
                genres.push(new Genre(simklGenre));
            }
        }
        return genres;
    }

    private convertPosterIdToCover(posterId: string): Cover[] {
        const covers: Cover[] = [];
        const url = 'https://simkl.net/posters/';
        if (posterId) {
            covers.push(new Cover(url + posterId + '_m.webp', ImageSize.MAX));
            covers.push(new Cover(url + posterId + '_ca.webp', ImageSize.MEDIUM));
            covers.push(new Cover(url + posterId + '_c.webp', ImageSize.SMALL));
            covers.push(new Cover(url + posterId + '_cm.webp', ImageSize.TINY));
            covers.push(new Cover(url + posterId + '_s.webp', ImageSize.VERYTINY));
        }
        return covers;
    }

    private convertAnimeTypeToMediaType(animeType: string): MediaType {
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
