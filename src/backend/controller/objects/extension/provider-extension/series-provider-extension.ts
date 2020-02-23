import ProviderDataListAdder from '../../../../../backend/controller/provider-data-list-manager/provider-data-list-adder';
import ProviderDataListSearcher from '../../../../../backend/controller/provider-data-list-manager/provider-data-list-searcher';
import ExternalProvider from '../../../../api/provider/external-provider';
import ProviderLocalData from '../../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderComperator from '../../../../helpFunctions/comperators/provider-comperator';
import ProviderDataWithSeasonInfo from '../../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import seasonHelper from '../../../../helpFunctions/season-helper/season-helper';
import logger from '../../../../logger/logger';
import { InfoProviderLocalData } from '../../../provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../provider-manager/local-data/list-provider-local-data';
import Season from '../../meta/season';
import InfoLocalDataBind from './binding/info-local-data-bind';
import ListLocalDataBind from './binding/list-local-data-bind';
import LocalDataBind from './binding/local-data-bind';


export default class SeriesProviderExtension {


    public static instanceOfInfoProviderLocalData(pld: ProviderLocalData) {
        if (pld instanceof InfoProviderLocalData || pld.instanceName === 'InfoProviderLocalData') {
            return true;
        }
        return false;
    }

    public static instanceOfListProviderLocalData(pld: ProviderLocalData) {
        if (pld instanceof ListProviderLocalData || pld.instanceName === 'ListProviderLocalData') {
            return true;
        }
        return false;
    }
    protected listProviderInfos: ListLocalDataBind[] = [];
    protected infoProviderInfos: InfoLocalDataBind[] = [];

    /**
     * Prevents too have double entrys of the same provider.
     * @param infoProviders
     */
    public async addInfoProvider(infoProvider: InfoProviderLocalData, season?: Season) {
        const index = await new ProviderDataListAdder().addNewProviderData(infoProvider);
        this.addInfoProviderBindings(new InfoLocalDataBind(infoProvider, season, index));
    }

    /**
     * Prevents too have double entrys of the same provider.
     * @param listProvider
     */
    public async addListProvider(listProvider: ListProviderLocalData, season?: Season) {
        const index = await new ProviderDataListAdder().addNewProviderData(listProvider);
        this.addListProviderBindings(new ListLocalDataBind(listProvider, season, index));
    }

    public async addProviderDatas(...localdatas: ProviderLocalData[]) {
        for (const localdata of localdatas) {
            if (SeriesProviderExtension.instanceOfListProviderLocalData(localdata)) {
                await this.addListProvider(localdata as ListProviderLocalData);
            } else if (SeriesProviderExtension.instanceOfInfoProviderLocalData(localdata)) {
                await this.addInfoProvider(localdata as InfoProviderLocalData);
            }
        }
    }

    public async addProviderDatasWithSeasonInfos(...localdatas: ProviderDataWithSeasonInfo[]) {
        logger.debug('addProviderDatasWithSeasonInfo: adding ' + localdatas.length);
        try {
            for (let index = 0; index < localdatas.length; index++) {
                const localdata = localdatas[index];
                if (SeriesProviderExtension.instanceOfListProviderLocalData(localdata.providerLocalData)) {
                    await this.addListProvider(localdata.providerLocalData as ListProviderLocalData, localdata.seasonTarget);
                } else if (SeriesProviderExtension.instanceOfInfoProviderLocalData(localdata.providerLocalData)) {
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

    public getListProvidersInfosWithSeasonInfo(): ProviderDataWithSeasonInfo[] {
        const realData = ProviderDataListSearcher.getAllBindedProviderWithSeasonInfo(...this.listProviderInfos);
        return realData;
    }

    public getInfoProvidersInfosWithSeasonInfo(): ProviderDataWithSeasonInfo[] {
        const realData = ProviderDataListSearcher.getAllBindedProviderWithSeasonInfo(...this.infoProviderInfos);
        return realData;
    }

    public getAllProviderBindings(): LocalDataBind[] {
        return [...this.infoProviderInfos, ...this.listProviderInfos];
    }

    public addAllBindings(...localDataBindings: LocalDataBind[]) {
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

    public addInfoProviderBindings(...infoLocalDataBinds: InfoLocalDataBind[]) {
        for (const infoLocalDataBind of infoLocalDataBinds) {
            const existingBinding = this.infoProviderInfos.findIndex((x) => x.providerName === infoLocalDataBind.providerName);
            if (existingBinding !== -1) {
                if (ProviderComperator.simpleProviderIdCheck(infoLocalDataBind.id, this.infoProviderInfos[existingBinding].id)) {
                    if (this.infoProviderInfos[existingBinding].targetSeason !== infoLocalDataBind.targetSeason && infoLocalDataBind.targetSeason !== undefined) {
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

    public addListProviderBindings(...listLocalDataBinds: ListLocalDataBind[]) {
        for (const listLocalDataBind of listLocalDataBinds) {
            let existingBindingIndex = this.listProviderInfos.findIndex((x) => x.providerName === listLocalDataBind.providerName && ProviderComperator.simpleProviderIdCheck(x.id, listLocalDataBind.id));
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

    public getAllProviderLocalDatasWithSeasonInfo(): ProviderDataWithSeasonInfo[] {
        const localdata: ProviderDataWithSeasonInfo[] = [];
        localdata.push(...this.getListProvidersInfosWithSeasonInfo());
        localdata.push(...this.getInfoProvidersInfosWithSeasonInfo());
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
    public getProviderLocalDataWithSeasonInfo(provider: ExternalProvider): ProviderDataWithSeasonInfo | undefined {
        const localdata: ProviderDataWithSeasonInfo[] = this.getAllProviderLocalDatasWithSeasonInfo();
        return localdata.find((entry) => entry.providerLocalData.provider === provider.providerName);
    }
}
