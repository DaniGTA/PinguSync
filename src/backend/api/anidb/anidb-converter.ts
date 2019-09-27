import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { Anime } from './objects/anidbNameListXML';
import AniDBProvider from './anidb-provider';
import MultiProviderResult from '../multi-provider-result';
import { NameType } from '../../controller/objects/meta/name-type';
import { AniDBAnimeFullInfo, AttributeInfo, ExternalentityElement, FluffyExternalentity, ResourceElement, AniDBAnimeAnime } from './objects/anidbFullInfoXML';
import Name from '../../controller/objects/meta/name';
import { MediaType } from '../../controller/objects/meta/media-type';
import Overview from '../../controller/objects/meta/overview';
import Cover from '../../controller/objects/meta/cover';
import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import { ImageSize } from '../../controller/objects/meta/image-size';
import Genre from '../../controller/objects/meta/genre';

export default class AniDBConverter {
    async convertAnimeToLocalData(anime: Anime): Promise<MultiProviderResult> {

        const ipld = new InfoProviderLocalData(AniDBProvider.instance);
        ipld.id = anime._attributes.aid;
        ipld.rawEntry = anime;
        ipld.version = AniDBProvider.instance.version;
        ipld.fullInfo = false;
        return new MultiProviderResult(ipld);
    }

    async convertFullInfoToProviderLocalData(fullInfo: AniDBAnimeFullInfo): Promise<MultiProviderResult> {
        if (fullInfo.anime) {
            const ipld = new InfoProviderLocalData(AniDBProvider.instance);
            for (const title of fullInfo.anime.titles.title) {
                ipld.addSeriesName(new Name(title._text, title._attributes["xml:lang"], await this.convertToNameType(title._attributes.type)))
            }
            ipld.id = fullInfo.anime._attributes.id;
            ipld.fullInfo = true;
            ipld.releaseYear = new Date(fullInfo.anime.startdate._text).getFullYear();
            ipld.rawEntry = fullInfo;
            ipld.mediaType = await this.convertToMediaType(fullInfo.anime.type._text);
            if (fullInfo.anime.description) {
                ipld.addOverview(new Overview(fullInfo.anime.description._text, "en"));
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
                        case "Prequel":
                            ipld.sequelIds.push(Number(relatedAnime._attributes.id));
                            break;
                        case "Sequel":
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
            ipld.covers.push(new Cover('https://cdn.anidb.net/images/main/'+fullInfo.anime.picture._text,ImageSize.ORIGINAL))
            const mpr = new MultiProviderResult(ipld);;
            mpr.subProviders = await this.getSubProviders(fullInfo.anime);
            return mpr;
        }
        throw 'no anime present';
    }

    async getSubProviders(anime: AniDBAnimeAnime): Promise<ProviderLocalData[]> {
         const subProviders = []
        if (Array.isArray(anime.resources.resource)) {
            for (const resource of anime.resources.resource) {
                try {
                    subProviders.push(await this.getResourceInfoProvider(resource));
                } catch (err) {
                    console.log(err); 
                }  
            }
        }
        return subProviders;
    }

    getGenres(anime: AniDBAnimeAnime): Genre[] {
        const genres = []
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
    async getResourceInfoProvider(resource: ResourceElement):Promise<ProviderLocalData> {
        let subipld = null;
        switch (resource._attributes.type) {
            case '1':
                subipld = new InfoProviderLocalData("ANN");
                break;
            case '2':
                subipld = new InfoProviderLocalData("MAL");
                break;
            case '3':
                subipld = new InfoProviderLocalData("AnimeNfo");
                break;
            case '6':
                subipld = new InfoProviderLocalData("WikiEnglish");
                break;
            case '7':
                subipld = new InfoProviderLocalData("WikiJapanese");
                break;
            case '8':
                subipld = new InfoProviderLocalData("Syoboi");
                break;
            case '9':
                subipld = new InfoProviderLocalData("AllCinema");
                break;
            case '10':
                subipld = new InfoProviderLocalData("Anison");
                break;
            case '11':
                subipld = new InfoProviderLocalData("LainGrJp");
                break;
            case '14':
                subipld = new InfoProviderLocalData("VNDB");
                break;
            case '15':
                subipld = new InfoProviderLocalData("MaruMegane");
                break;
            case '17':
                subipld = new InfoProviderLocalData("TVAnimation");
                break;
            case '19':
                subipld = new InfoProviderLocalData("WikiKorean");
                break;
            case '20':
                subipld = new InfoProviderLocalData("WikiChinese");
                break;
            case '23':
                subipld = new InfoProviderLocalData("twitter");
                break;
            case '28':
                subipld = new InfoProviderLocalData("crunchyroll");
                break;
            case '32':
                subipld = new InfoProviderLocalData("amazon");
                break;
        }

        if (subipld) {
            subipld.id = await this.getIDResourceFromEntity(resource.externalentity);
            subipld.fullInfo = false;
            return subipld;
        }
        throw 'no provider with that type found: ' + resource._attributes.type;
    }

    async getIDResourceFromEntity(input: ExternalentityElement[] | FluffyExternalentity): Promise<number | string >{
        if (Array.isArray(input)) {
            return input[0].identifier._text;
        } else {
            if (input.identifier && Array.isArray(input.identifier)) {
                return input.identifier[0]._text;
            } else if(input.identifier && !Array.isArray(input.identifier)){
                return input.identifier._text;
            }
        }
        throw 'no id';
    }

    async convertToMediaType(string: string): Promise<MediaType> {
       switch (string) {
            case "TV Series":
                return MediaType.ANIME;
            case "Movie":
                return MediaType.MOVIE;
            case "OVA":
                return MediaType.SPECIAL;
            default:
                return MediaType.UNKOWN;
        } 
    }

    async convertToNameType(string:string){
        switch (string) {
            case "main":
                return NameType.MAIN;
            case "official":
                return NameType.OFFICIAL;
            case "short":
                return NameType.SHORT;
            case "syn":
                return NameType.SYN;
            default:
                return NameType.UNKNOWN;
        }
    }
}
