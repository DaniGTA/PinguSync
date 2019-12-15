import ProviderDataListAdder from '../../../../../backend/controller/provider-data-list-manager/provider-data-list-adder';
import ProviderDataListSearcher from '../../../../../backend/controller/provider-data-list-manager/provider-data-list-searcher';
import ProviderLocalData from '../../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import { InfoProviderLocalData } from '../../../provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../provider-manager/local-data/list-provider-local-data';
import InfoLocalDataBind from './binding/info-local-data-bind';
import ListLocalDataBind from './binding/list-local-data-bind';
import LocalDataBind from './binding/local-data-bind';


export default class SeriesProviderExtension {
    protected listProviderInfos: ListLocalDataBind[] = [];
    protected infoProviderInfos: InfoLocalDataBind[] = [];

    /**
     * Prevents too have double entrys of the same provider.
     * @param infoProviders
     */
    public async addInfoProvider(...infoProviders: InfoProviderLocalData[]) {
        for (const infoProvider of infoProviders) {
            const index = this.infoProviderInfos.findIndex((x) => infoProvider.provider === x.providerName);
            if (index === -1) {
                this.infoProviderInfos.push(new InfoLocalDataBind(infoProvider));
                await new ProviderDataListAdder().addNewProviderData(infoProvider);
            } else {
                await new ProviderDataListAdder().addNewProviderData(infoProvider);
            }
        }
    }

    /**
     * Prevents too have double entrys of the same provider.
     * @param listProvider
     */
    public async addListProvider(...listProviders: ListProviderLocalData[]) {
        for (const listProvider of listProviders) {
            const index = this.listProviderInfos.findIndex((x) => listProvider.provider === x.providerName);
            if (index === -1) {
                this.listProviderInfos.push(new ListLocalDataBind(listProvider));
                await new ProviderDataListAdder().addNewProviderData(listProvider);
            } else {
                await new ProviderDataListAdder().addNewProviderData(listProvider);
            }
        }
    }

    public async addProviderDatas(...localdatas: ProviderLocalData[]) {
        for (const localdata of localdatas) {
            if (localdata instanceof ListProviderLocalData) {
                await this.addListProvider(localdata as ListProviderLocalData);
            } else if (localdata instanceof InfoProviderLocalData) {
                await this.addInfoProvider(localdata as InfoProviderLocalData);
            }
        }
    }

    public getListProvidersInfos(): ListProviderLocalData[] {
        const realData = ProviderDataListSearcher.getAllBindedProvider(...this.listProviderInfos);
        return realData as ListProviderLocalData[];
    }

    public getInfoProvidersInfos(): InfoProviderLocalData[] {
        const realData = ProviderDataListSearcher.getAllBindedProvider(...this.infoProviderInfos);
        return realData as InfoProviderLocalData[];
    }

    public getAllProviderBindings(): LocalDataBind[] {
        return [...this.infoProviderInfos, ...this.listProviderInfos];
    }

}
