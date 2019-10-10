import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import Cover from '../../controller/objects/meta/cover';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeTitle from '../../controller/objects/meta/episode/episode-title';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Genre from '../../controller/objects/meta/genre';
import { ImageSize } from '../../controller/objects/meta/image-size';
import { MediaType } from '../../controller/objects/meta/media-type';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import Overview from '../../controller/objects/meta/overview';
import MultiProviderResult from '../multi-provider-result';
import AniDBProvider from './anidb-provider';
import { AniDBAnimeAnime, AniDBAnimeFullInfo, AttributeInfo, EpisodeElement, ExternalentityElement, FluffyExternalentity, ResourceElement } from './objects/anidbFullInfoXML';
import { Anime } from './objects/anidbNameListXML';

export default class AniDBConverter {
    public async convertAnimeToLocalData(anime: Anime): Promise<MultiProviderResult> {

        const ipld = new InfoProviderLocalData(AniDBProvider.instance);
        ipld.id = anime._attributes.aid;
        ipld.rawEntry = anime;
        ipld.version = AniDBProvider.instance.version;
        ipld.hasFullInfo = false;
        return new MultiProviderResult(ipld);
    }

    public async convertFullInfoToProviderLocalData(fullInfo: AniDBAnimeFullInfo): Promise<MultiProviderResult> {
        if (fullInfo.anime) {
            const ipld = new InfoProviderLocalData(AniDBProvider.instance);
            for (const title of fullInfo.anime.titles.title) {
                ipld.addSeriesName(new Name(title._text, title._attributes['xml:lang'], await this.convertToNameType(title._attributes.type)));
            }
            ipld.id = fullInfo.anime._attributes.id;
            ipld.hasFullInfo = true;
            ipld.releaseYear = new Date(fullInfo.anime.startdate._text).getFullYear();
            ipld.rawEntry = fullInfo;
            ipld.mediaType = await this.convertToMediaType(fullInfo.anime.type._text);
            if (fullInfo.anime.description) {
                ipld.addOverview(new Overview(fullInfo.anime.description._text, 'en'));
            }

            if (fullInfo.anime.relatedanime) {
                const relatedanimeAnimeList: AttributeInfo[] = [];
                if (Array.isArray(fullInfo.anime.relatedanime.anime)) {
                    relatedanimeAnimeList.push(...fullInfo.anime.relatedanime.anime);
                } else {
                    relatedanimeAnimeList.push(fullInfo.anime.relatedanime.anime);
                }
                for (const relatedAnime of relatedanimeAnimeList) {
                    switch (relatedAnime._attributes.type) {
                        case 'Prequel':
                            ipld.sequelIds.push(Number(relatedAnime._attributes.id));
                            break;
                        case 'Sequel':
                            ipld.prequelIds.push(Number(relatedAnime._attributes.id));
                            break;
                        default:
                            ipld.alternativeIds.push(Number(relatedAnime._attributes.id));
                            break;
                    }
                }
            }

            ipld.genres = this.getGenres(fullInfo.anime);
            ipld.episodes = Number(fullInfo.anime.episodecount._text);
            ipld.detailEpisodeInfo = await this.getDetailEpisodeInfo(fullInfo.anime);
            ipld.covers.push(new Cover('https://cdn.anidb.net/images/main/' + fullInfo.anime.picture._text, ImageSize.ORIGINAL));
            const mpr = new MultiProviderResult(ipld);
            mpr.subProviders = await this.getSubProviders(fullInfo.anime);
            return mpr;
        }
        throw new Error('no anime present');
    }

    public async getDetailEpisodeInfo(anime: AniDBAnimeAnime): Promise<Episode[]> {
        const episodes: Episode[] = [];
        if (anime.episodes.episode && Array.isArray(anime.episodes.episode)) {
            for (const episode of anime.episodes.episode) {
                const tempEpisode = new Episode(parseInt(episode.epno._text));
                if (episode.airdate) {
                    tempEpisode.airDate = new Date(episode.airdate._text);
                }
                tempEpisode.duration = Number(episode.length._text);
                tempEpisode.type = await this.getEpisodeType(episode);
                tempEpisode.rating = episode.rating ? Number(episode.rating._text) : undefined;
                tempEpisode.summery = episode.summary ? episode.summary._text : undefined;

                tempEpisode.title = await this.getEpisodeTitles(episode);
                tempEpisode.lastProviderUpdate = new Date(episode._attributes.update).getDate();
                tempEpisode.providerEpisodeId = episode._attributes.id;
            }
        }
        return episodes;
    }

    public async getEpisodeTitles(episode: EpisodeElement): Promise<EpisodeTitle[]> {
        const episodeTitles: EpisodeTitle[] = [];
        if (Array.isArray(episode.title)) {
            for (const episodeTile of episode.title) {
                episodeTitles.push(new EpisodeTitle(episodeTile._text, episodeTile._attributes['xml:lang']));
            }
        } else {
            episodeTitles.push(new EpisodeTitle(episode.title._text, episode.title._attributes['xml:lang']));
        }
        return episodeTitles;
    }

    public async getEpisodeType(episode: EpisodeElement): Promise<EpisodeType> {
        if (episode.epno._attributes.type === '2' && episode.epno._text.charAt(0) === 'S') {
            return EpisodeType.SPECIAL;
        }
        switch (episode.epno._attributes.type) {
            case '1':
                return EpisodeType.REGULAR_EPISODE;
            case '2':
                return EpisodeType.OPENING_OR_ENDING;
            case '3':
                return EpisodeType.OTHER;
            default:
                return EpisodeType.UNKOWN;
        }
    }

    public async getSubProviders(anime: AniDBAnimeAnime): Promise<ProviderLocalData[]> {
        const subProviders = [];
        if (Array.isArray(anime.resources.resource)) {
            for (const resource of anime.resources.resource) {
                try {
                    subProviders.push(await this.getResourceInfoProvider(resource));
                } catch (err) {
                    console.error(err);
                }
            }
        }
        return subProviders;
    }

    public getGenres(anime: AniDBAnimeAnime): Genre[] {
        const genres = [];
        if (anime.tags && Array.isArray(anime.tags)) {
            for (const tag of anime.tags) {
                genres.push(new Genre(tag.name));
            }
        }
        return genres;
    }

    // Completely undocumented.
    // Most entries just have one or two numbers as Identifiers.
    //
    // Empiric documentation:
    //
    // Type 1 is the ANN id.
    //
    // Type 2 is the MyAnimeList ID.
    //
    // Type 3 is the AnimeNfo ID tuple.
    //
    // Type 4 is the official japanese webpage. URL may contain additional URLs (official PV, etc)
    //
    // Type 5 is the official english webpage.
    //
    // Type 6 is the english wikipedia page name.
    //
    // Type 7 is the japanese wikipedia page name.
    //
    // Type 8 is the cal.syoboi.jp schedule ID.
    //
    // Type 9 is the AllCinema ID.
    //
    // Type 10 is the anison.info ID.
    //
    // Type 11 is the lain.gr.jp path.
    //
    // Type 14 is the VNDB ID.
    //
    // Type 15 is the MaruMegane ID.
    //
    // Type 17 would be the TV Animation Museum identifier, but the website is no more.
    //
    // Type 19 is the korean wikipedia page name.
    //
    // Type 20 is the chinese wikipedia page name.
    //
    // Type 23 is Twitter.
    //
    // Type 28 is Crunchyroll
    //
    // Type 32 is Amazon
    public async getResourceInfoProvider(resource: ResourceElement): Promise<ProviderLocalData> {
        let subipld = null;
        switch (resource._attributes.type) {
            case '1':
                subipld = new InfoProviderLocalData('ANN');
                break;
            case '2':
                subipld = new InfoProviderLocalData('MAL');
                break;
            case '3':
                subipld = new InfoProviderLocalData('AnimeNfo');
                break;
            case '6':
                subipld = new InfoProviderLocalData('WikiEnglish');
                break;
            case '7':
                subipld = new InfoProviderLocalData('WikiJapanese');
                break;
            case '8':
                subipld = new InfoProviderLocalData('Syoboi');
                break;
            case '9':
                subipld = new InfoProviderLocalData('AllCinema');
                break;
            case '10':
                subipld = new InfoProviderLocalData('Anison');
                break;
            case '11':
                subipld = new InfoProviderLocalData('LainGrJp');
                break;
            case '14':
                subipld = new InfoProviderLocalData('VNDB');
                break;
            case '15':
                subipld = new InfoProviderLocalData('MaruMegane');
                break;
            case '17':
                subipld = new InfoProviderLocalData('TVAnimation');
                break;
            case '19':
                subipld = new InfoProviderLocalData('WikiKorean');
                break;
            case '20':
                subipld = new InfoProviderLocalData('WikiChinese');
                break;
            case '23':
                subipld = new InfoProviderLocalData('twitter');
                break;
            case '28':
                subipld = new InfoProviderLocalData('crunchyroll');
                break;
            case '32':
                subipld = new InfoProviderLocalData('amazon');
                break;
        }

        if (subipld) {
            subipld.id = await this.getIDResourceFromEntity(resource.externalentity);
            subipld.hasFullInfo = false;
            return subipld;
        }
        throw new Error('no provider with that type found: ' + resource._attributes.type);
    }

    public async getIDResourceFromEntity(input: ExternalentityElement[] | FluffyExternalentity): Promise<number | string> {
        if (Array.isArray(input)) {
            return input[0].identifier._text;
        } else {
            if (input.identifier && Array.isArray(input.identifier)) {
                return input.identifier[0]._text;
            } else if (input.identifier && !Array.isArray(input.identifier)) {
                return input.identifier._text;
            }
        }
        throw new Error('no id');
    }

    public async convertToMediaType(s: string): Promise<MediaType> {
        switch (s) {
            case 'TV Series':
                return MediaType.ANIME;
            case 'Movie':
                return MediaType.MOVIE;
            case 'OVA':
                return MediaType.SPECIAL;
            default:
                return MediaType.UNKOWN;
        }
    }

    public async convertToNameType(s: string) {
        switch (s) {
            case 'main':
                return NameType.MAIN;
            case 'official':
                return NameType.OFFICIAL;
            case 'short':
                return NameType.SHORT;
            case 'syn':
                return NameType.SYN;
            default:
                return NameType.UNKNOWN;
        }
    }
}
