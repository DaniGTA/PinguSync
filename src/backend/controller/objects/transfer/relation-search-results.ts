import ProviderLocalData from '../../provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import Series from '../series';

export default class RelationSearchResults {
    public searchedProviders: ProviderLocalData[];
    public foundedSeries: Series | null;
    public relationExistButNotFounded = false;
    constructor(foundedSeries: Series | null, ...searchedProviders: ProviderLocalData[]) {
        this.foundedSeries = foundedSeries;
        this.searchedProviders = searchedProviders;
        if (this.foundedSeries == null && searchedProviders.length !== 0) {
            this.relationExistButNotFounded = true;
        } else {
            this.relationExistButNotFounded = false;
        }
    }
}
