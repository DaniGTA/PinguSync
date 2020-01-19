import ProviderDataListAdder from '../../../../../backend/controller/provider-data-list-manager/provider-data-list-adder';
import ProviderDataListSearcher from '../../../../../backend/controller/provider-data-list-manager/provider-data-list-searcher';
import ProviderLocalData from '../../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderComperator from '../../../../helpFunctions/comperators/provider-comperator';
import ProviderDataWithSeasonInfo from '../../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import logger from '../../../../logger/logger';
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
    public async addInfoProvider(infoProvider: InfoProviderLocalData, season?: number) {
        this.addInfoProviderBindings(new InfoLocalDataBind(infoProvider, season));
        await new ProviderDataListAdder().addNewProviderData(infoProvider);
    }

    /**
     * Prevents too have double entrys of the same provider.
     * @param listProvider
     */
    public async addListProvider(listProvider: ListProviderLocalData, season?: number) {
        this.addListProviderBindings(new ListLocalDataBind(listProvider, season));
        await new ProviderDataListAdder().addNewProviderData(listProvider);
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

    public async addProviderDatasWithSeasonInfos(...localdatas: ProviderDataWithSeasonInfo[]) {
        logger.debug('addProviderDatasWithSeasonInfo: adding ' + localdatas.length);
        try {
            for (let index = 0; index < localdatas.length; index++) {
                const localdata = localdatas[index];
                if (localdata.providerLocalData instanceof ListProviderLocalData) {
                    await this.addListProvider(localdata.providerLocalData as ListProviderLocalData, localdata.seasonTarget);
                } else if (localdata.providerLocalData instanceof InfoProviderLocalData) {
                    await this.addInfoProvider(localdata.providerLocalData as InfoProviderLocalData, localdata.seasonTarget);
                } else {
                    logger.debug('addProviderDatasWithSeasonInfos cant add unkown instance');
                }
            }
        } catch (err) {
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
            if (localDataBinding instanceof InfoLocalDataBind) {
                this.addInfoProviderBindings(localDataBinding);
            } else if (localDataBinding instanceof ListLocalDataBind) {
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
            let existingBinding = this.listProviderInfos.find((x) => x.providerName === listLocalDataBind.providerName && ProviderComperator.simpleProviderIdCheck(x.id, listLocalDataBind.id));
            if (existingBinding) {
                if (existingBinding.targetSeason !== listLocalDataBind.targetSeason && listLocalDataBind.targetSeason !== undefined) {
                    existingBinding = listLocalDataBind;
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
}
