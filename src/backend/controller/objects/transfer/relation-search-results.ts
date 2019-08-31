import Series from '../series';
import ProviderLocalData from '../../interfaces/provider-local-data';

export default class RelationSearchResults {
    searchedProviders: ProviderLocalData[];
    foundedSeries: Series | null;
    relationExistButNotFounded = false;
    constructor(foundedSeries: Series | null, ...searchedProviders: ProviderLocalData[]) {
        this.foundedSeries = foundedSeries;
        this.searchedProviders = searchedProviders;
        if (this.foundedSeries == null && searchedProviders.length != 0) {
            this.relationExistButNotFounded = true;
        } else {
            this.relationExistButNotFounded = false;
        }
    }
}
