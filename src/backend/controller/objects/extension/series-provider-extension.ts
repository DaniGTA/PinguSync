import { InfoProviderLocalData } from '../../provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../provider-manager/local-data/list-provider-local-data';


export default class SeriesProviderExtension {
    protected listProviderInfos: ListProviderLocalData[] = [];
    protected infoProviderInfos: InfoProviderLocalData[] = [];

    /**
     * Prevents too have double entrys of the same provider.
     * @param infoProvider
     */
    public async addInfoProvider(infoProvider: InfoProviderLocalData) {
        const index = this.infoProviderInfos.findIndex((x) => infoProvider.provider === x.provider);
        if (index === -1) {
            this.infoProviderInfos.push(infoProvider);
        } else {
            this.infoProviderInfos[index] = await InfoProviderLocalData.mergeProviderInfos(this.infoProviderInfos[index], infoProvider);
        }
    }

    /**
     * Prevents too have double entrys of the same provider.
     * @param listProvider
     */
    public async addListProvider(...listProviders: ListProviderLocalData[]) {
        for (const listProvider of listProviders) {
            const index = this.listProviderInfos.findIndex((x) => listProvider.provider === x.provider);
            if (index === -1) {
                this.listProviderInfos.push(listProvider);
            } else {
                this.listProviderInfos[index] = await ListProviderLocalData.mergeProviderInfos(this.listProviderInfos[index], listProvider);
            }
        }
    }

    public getListProvidersInfos(): ListProviderLocalData[] {
        return this.listProviderInfos;
    }

    public getInfoProvidersInfos(): InfoProviderLocalData[] {
        return this.infoProviderInfos;
    }


}
