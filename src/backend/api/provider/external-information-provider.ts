import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ExternalProvider from './external-provider';
import MultiProviderResult from './multi-provider-result';

export default abstract class ExternalInformationProvider extends ExternalProvider {
    public requireInternetAccessGetMoreSeriesInfoByName = true;
    public requireInternetAccessForGetFullById = true;
    public hasEpisodeTitleOnFullInfo = false;
    /**
     * If a series name should contain any letters that are not in the basic latin table it will not try to perform a name search.
     * Basic Latin table (UTF-8):
     * http://memory.loc.gov/diglib/codetables/42.html
     *
     * @memberof ExternalProvider
     */
    public supportOnlyBasicLatinForNameSearch = true;

    public abstract hasUniqueIdForSeasons: boolean;

    public abstract getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<MultiProviderResult[]>;
    public abstract getFullInfoById(provider: ProviderLocalData): Promise<MultiProviderResult>;
}
