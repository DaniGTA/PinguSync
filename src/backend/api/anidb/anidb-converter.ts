import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { Anime } from './objects/anidbNameListXML';
import AniDBProvider from './anidb-provider';
import MultiProviderResult from '../multi-provider-result';

export default class AniDBConverter {
    async convertAnimeToLocalData(anime: Anime): Promise<MultiProviderResult> {

        const ipld = new InfoProviderLocalData(AniDBProvider.instance);
        ipld.id = anime._attributes.aid;
        ipld.version = AniDBProvider.instance.version;
        ipld.fullInfo = false;
        return new MultiProviderResult(ipld);
    }
}
