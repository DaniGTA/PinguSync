import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { Anime } from './objects/anidbNameListXML';
import AniDBProvider from './anidb-provider';

export default class AniDBConverter {
    async convertAnimeToLocalData(anime: Anime): Promise<InfoProviderLocalData> {

        const ipld = new InfoProviderLocalData(AniDBProvider.instance);
        ipld.id = anime._attributes.aid;
        ipld.version = AniDBProvider.instance.version;
        return ipld;
    }
}
