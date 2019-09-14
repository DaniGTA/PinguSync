import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { Anime } from './objects/anidbNameListXML';
import AniDBProvider from './anidb-provider';
import MultiProviderResult from '../multi-provider-result';
import { NameType } from '../../controller/objects/meta/name-type';

export default class AniDBConverter {
    async convertAnimeToLocalData(anime: Anime): Promise<MultiProviderResult> {

        const ipld = new InfoProviderLocalData(AniDBProvider.instance);
        ipld.id = anime._attributes.aid;
        ipld.rawEntry = anime;
        ipld.version = AniDBProvider.instance.version;
        ipld.fullInfo = false;
        return new MultiProviderResult(ipld);
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
