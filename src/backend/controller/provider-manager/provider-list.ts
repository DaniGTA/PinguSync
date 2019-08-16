import ListProvider from "../../api/list-provider";
import InfoProvider from '../../api/info-provider';
import ProviderLoader from './provider-loader';

export default class ProviderList extends ProviderLoader {
    public static getListProviderList(): ListProvider[] {
        if (!this.loadedListProvider) {
            this.loadedListProvider = this.loadListProviderList();
            return this.loadedListProvider;
        } else {
            return this.loadedListProvider;
        }
    }

    public static getInfoProviderList(): InfoProvider[] {
         if (!this.loadedInfoProvider) {
            this.loadedInfoProvider = this.loadInfoProviderList();
            return this.loadedInfoProvider;
        } else {
            return this.loadedInfoProvider;
        }
    }
    
}
