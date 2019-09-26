import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { Anime } from './objects/anidbNameListXML';
import AniDBProvider from './anidb-provider';
import MultiProviderResult from '../multi-provider-result';
import { NameType } from '../../controller/objects/meta/name-type';
import { AniDBAnimeFullInfo } from './objects/anidbFullInfoXML';
import Name from '../../controller/objects/meta/name';
import { MediaType } from '../../controller/objects/meta/media-type';

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
            ipld.rawEntry = fullInfo;
            ipld.mediaType = await this.convertToMediaType(fullInfo.anime.type._text);
        
            for (const relatedAnime of fullInfo.anime.relatedanime.anime) {
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

            return new MultiProviderResult(ipld);
        }
        throw 'no anime present';
    }

    async convertToMediaType(string: string): Promise<MediaType> {
       switch (string) {
            case "TV Series":
                return MediaType.ANIME;
            case "official":
                return MediaType.MOVIE;
            case "short":
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
