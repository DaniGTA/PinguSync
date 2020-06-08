import ExternalProvider from '../../../../api/provider/external-provider';
import ProviderComperator from '../../../../helpFunctions/comperators/provider-comperator';
import ProviderLocalDataWithSeasonInfo from '../../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import seasonHelper from '../../../../helpFunctions/season-helper/season-helper';
import logger from '../../../../logger/logger';
import ProviderDataListAdder from '../../../provider-controller/provider-data-list-manager/provider-data-list-adder';
import ProviderDataListSearcher from '../../../provider-controller/provider-data-list-manager/provider-data-list-searcher';
import { InfoProviderLocalData } from '../../../provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../provider-controller/provider-manager/local-data/list-provider-local-data';
import FailedProviderRequest from '../../meta/failed-provider-request';
import Season from '../../meta/season';
import InfoLocalDataBind from './binding/info-local-data-bind';
import ListLocalDataBind from './binding/list-local-data-bind';
import LocalDataBind from './binding/local-data-bind';
import SeriesProviderExtensionInstanceCheck from './series-provider-extension-instance-check';


export default class SeriesProviderExtension {
    protected listProviderInfos: ListLocalDataBind[] = [];
    protected infoProviderInfos: InfoLocalDataBind[] = [];

    protected failedProviderRequest: FailedProviderRequest[] = [];

    public clearAllBindings(): void {
        this.listProviderInfos = [];
        this.infoProviderInfos = [];
    }

    public addFailedRequest(failedRequest: FailedProviderRequest): void {
        this.failedProviderRequest.push(failedRequest);
    }

    public getAllErrosForOneProvider(provider: ExternalProvider): FailedProviderRequest[] {
        return this.failedProviderRequest.filter((failedRequest) => failedRequest.providerName === provider.providerName);
    }

    /**
     * Prevents too have double entrys of the same provider.
     * @param infoProviders
     */
    public async addInfoProvider(infoProvider: InfoProviderLocalData, season?: Season): Promise<void> {
        const index = await new ProviderDataListAdder().addNewProviderData(infoProvider);
        this.addInfoProviderBindings(new InfoLocalDataBind(infoProvider, season, index));
    }

    /**
     * Prevents too have double entrys of the same provider.
     * @param listProvider
     */
    public async addListProvider(listProvider: ListProviderLocalData, season?: Season): Promise<void> {
        const index = await new ProviderDataListAdder().addNewProviderData(listProvider);
        this.addListProviderBindings(new ListLocalDataBind(listProvider, season, index));
    }

    public async addProviderDatas(...localdatas: ProviderLocalData[]): Promise<void> {
        for (const localdata of localdatas) {
            if (SeriesProviderExtensionInstanceCheck.instanceOfListProviderLocalData(localdata)) {
                await this.addListProvider(localdata as ListProviderLocalData);
            } else if (SeriesProviderExtensionInstanceCheck.instanceOfInfoProviderLocalData(localdata)) {
                await this.addInfoProvider(localdata as InfoProviderLocalData);
            }
        }
    }

    public async addProviderDatasWithSeasonInfos(...localdatas: ProviderLocalDataWithSeasonInfo[]): Promise<void> {
        logger.debug('addProviderDatasWithSeasonInfo: adding ' + localdatas.length);
        try {
            for (let index = 0; index < localdatas.length; index++) {
                const localdata = localdatas[index];
                if (SeriesProviderExtensionInstanceCheck.instanceOfListProviderLocalData(localdata.providerLocalData)) {
                    await this.addListProvider(localdata.providerLocalData as ListProviderLocalData, localdata.seasonTarget);
                } else if (SeriesProviderExtensionInstanceCheck.instanceOfInfoProviderLocalData(localdata.providerLocalData)) {
                    await this.addInfoProvider(localdata.providerLocalData as InfoProviderLocalData, localdata.seasonTarget);
                } else {
                    logger.debug('addProviderDatasWithSeasonInfos cant add unkown instance');
                }
            }
        } catch (err) {
            logger.error('Error at SeriesProviderExtension.addProviderDatasWithSeasonInfos');
            logger.error(err);
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

    public getListProvidersLocalDataInfosWithSeasonInfo(): ProviderLocalDataWithSeasonInfo[] {
        const realData = ProviderDataListSearcher.getAllBindedProviderLocalDataWithSeasonInfo(...this.listProviderInfos);
        return realData;
    }

    public getInfoProvidersLocalDataInfosWithSeasonInfo(): ProviderLocalDataWithSeasonInfo[] {
        const realData = ProviderDataListSearcher.getAllBindedProviderLocalDataWithSeasonInfo(...this.infoProviderInfos);
        return realData;
    }

    public getAllProviderBindings(): LocalDataBind[] {
        return [...this.infoProviderInfos, ...this.listProviderInfos];
    }

    public addAllBindings(...localDataBindings: LocalDataBind[]): void {
        for (const localDataBinding of localDataBindings) {
            if (localDataBinding.instanceName === InfoLocalDataBind.name || localDataBinding instanceof InfoLocalDataBind) {
                this.addInfoProviderBindings(localDataBinding);
            } else if (localDataBinding.instanceName === ListLocalDataBind.name || localDataBinding instanceof ListLocalDataBind) {
                this.addListProviderBindings(localDataBinding);
            } else {
                logger.error('UNKOWN BINDING INSTANCE');
            }
        }
    }

    public addInfoProviderBindings(...infoLocalDataBinds: InfoLocalDataBind[]): void {
        for (const infoLocalDataBind of infoLocalDataBinds) {
            const existingBinding = this.infoProviderInfos.findIndex((x) => x.providerName === infoLocalDataBind.providerName);
            if (existingBinding !== -1) {
                if (ProviderComperator.simpleProviderIdCheck(infoLocalDataBind.id, this.infoProviderInfos[existingBinding].id)) {
                    if (this.infoProviderInfos[existingBinding].targetSeason !== infoLocalDataBind.targetSeason &&
                        infoLocalDataBind.targetSeason !== undefined) {
                        this.infoProviderInfos[existingBinding] = infoLocalDataBind;
                    }
                } else {
                    this.infoProviderInfos[existingBinding] = infoLocalDataBind;
                }
            } else {
                this.infoProviderInfos.push(infoLocalDataBind);
            }
        }
    }

    public addListProviderBindings(...listLocalDataBinds: ListLocalDataBind[]): void {
        for (const listLocalDataBind of listLocalDataBinds) {
            const existingBindingIndex = this.listProviderInfos.findIndex((x) =>
                x.providerName === listLocalDataBind.providerName &&
                ProviderComperator.simpleProviderIdCheck(x.id, listLocalDataBind.id));
            if (existingBindingIndex !== -1) {
                const existingBinding = this.listProviderInfos[existingBindingIndex];
                if (existingBinding.targetSeason !== listLocalDataBind.targetSeason && listLocalDataBind.targetSeason !== undefined) {
                    this.listProviderInfos[existingBindingIndex] = listLocalDataBind;
                } else if (seasonHelper.isSeasonUndefined(existingBinding.targetSeason)) {
                    this.listProviderInfos[existingBindingIndex] = listLocalDataBind;
                }
            } else {
                this.listProviderInfos.push(listLocalDataBind);
            }
        }
    }

    public getAllProviderLocalDatas(): ProviderLocalData[] {
        const localdata: ProviderLocalData[] = [];
        localdata.push(...this.getInfoProvidersInfos());
        localdata.push(...this.getListProvidersInfos());
        return localdata;
    }

    public getAllProviderLocalDatasWithSeasonInfo(): ProviderLocalDataWithSeasonInfo[] {
        const localdata: ProviderLocalDataWithSeasonInfo[] = [];
        localdata.push(...this.getListProvidersLocalDataInfosWithSeasonInfo());
        localdata.push(...this.getInfoProvidersLocalDataInfosWithSeasonInfo());
        return localdata;
    }
    /**
     * Get a single provider local data with the given provider.
     * @param provider the given provider.
     */
    public getProviderLocalData(provider: ExternalProvider): ProviderLocalData | undefined {
        const localdata: ProviderLocalData[] = this.getAllProviderLocalDatas();
        return localdata.find((entry) => entry.provider === provider.providerName);
    }

    /**
     * Get a single provider local data with the given provider.
     * @param provider the given provider.
     */
    public getProviderLocalDataWithSeasonInfo(provider: ExternalProvider): ProviderLocalDataWithSeasonInfo | undefined {
        const localdata: ProviderLocalDataWithSeasonInfo[] = this.getAllProviderLocalDatasWithSeasonInfo();
        return localdata.find((entry) => entry.providerLocalData.provider === provider.providerName);
    }
}
