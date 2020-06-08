import ListProvider from '../../../../api/provider/list-provider';
import ProviderList from '../provider-list';
import ProviderNameManager from '../provider-name-manager';
import ProviderLocalData from './interfaces/provider-local-data';
import { ListType } from '../../../settings/models/provider/list-types';

/**
 * Contains info about the series and the user watch progress and the list that series is in.
 */
export class ListProviderLocalData extends ProviderLocalData {

    public static async mergeProviderInfos(...providers: ListProviderLocalData[]): Promise<ListProviderLocalData> {
        const finalProvider = await this.mergeProviderLocalData(...providers) as ListProviderLocalData;
        return Object.assign(new ListProviderLocalData(finalProvider.id), finalProvider);
    }

    public readonly provider: string;

    public canUpdateWatchProgress = false;

    public watchStatus?: ListType;

    public customList = false;
    public customListName = '';
    public version = 1;

    constructor(id: string | number, lp?: ListProvider | string | (new () => ListProvider)) {
        super(id);
        this.lastUpdate = new Date(Date.now());
        if (lp) {
            if (typeof lp === 'string') {
                this.provider = lp;
            } else if (lp instanceof ListProvider) {
                this.provider = lp.providerName;
                this.version = lp.version;
            } else {
                this.provider = ProviderNameManager.getProviderName(lp);
            }
        } else {
            this.provider = '';
        }
    }


    public getProviderInstance(): ListProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw new Error('[ListProviderLocalData] NoProviderFound: ' + this.provider);
    }
}
