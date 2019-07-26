
import Anime from '../controller/objects/anime';
import { InfoProviderLocalData } from '../controller/objects/infoProviderLocalData';

/**
 * A name provider gives only a list of names.
 * That can be used to find other variants of the name.
 */
export default interface InfoProvider {
    providerName: string;
    getSeriesInfo(anime: Anime): Promise<InfoProviderLocalData>;
}
