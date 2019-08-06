
import Series from '../controller/objects/series';
import { InfoProviderLocalData } from '../controller/objects/infoProviderLocalData';
import Name from '../controller/objects/meta/name';
import Names from '../controller/objects/meta/names';

/**
 * A name provider gives only a list of names.
 * That can be used to find other variants of the name.
 */
export default interface InfoProvider {
    providerName: string;
    getSeriesInfo(anime: Series): Promise<InfoProviderLocalData>;
    getAllNames(names: Names): Promise<Name[]>;
}
