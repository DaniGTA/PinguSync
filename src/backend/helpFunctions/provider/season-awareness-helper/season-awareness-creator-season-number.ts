import ExternalProvider from '../../../api/provider/external-provider';
import MainListAdder from '../../../controller/main-list-manager/main-list-adder';
import Season from '../../../controller/objects/meta/season';
import Series from '../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../controller/provider-manager/provider-list';
import logger from '../../../logger/logger';
import EpisodeHelper from '../../episode-helper/episode-helper';
import EpisodeRelationAnalyser from '../../episode-helper/episode-relation-analyser';
import listHelper from '../../list-helper';
import TitleHelper from '../../name-helper/title-helper';
import seasonHelper from '../../season-helper/season-helper';
import ProviderHelper from '../provider-helper';
import ProviderLocalDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';
import providerInfoDownloaderhelper from '../provider-info-downloader/provider-info-downloaderhelper';
import SeasonAwarenessHelper from './season-awareness-helper';
import SeasonComperator from '../../comperators/season-comperator';
import ExternalInformationProvider from '../../../api/provider/external-information-provider';

export default class SeasonAwarenessCreatorSeasonNumber {
    private seriesThatShouldAdded: Series[] = [];
    public async requestSeasonAwareness(series: Series, extraInfoProviders: ProviderLocalDataWithSeasonInfo[] = []): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const finalResult: ProviderLocalDataWithSeasonInfo[] = [];
        for (const listProvider of series.getListProvidersLocalDataInfosWithSeasonInfo()) {
            try {
                if (ProviderList.getExternalProviderInstance(listProvider.providerLocalData).hasEpisodeTitleOnFullInfo) {
                    if (!SeasonAwarenessHelper.isProviderSeasonAware(listProvider)) {
                        const result = await this.requestSeasonAwarnessForProviderLocalData(series, extraInfoProviders, listProvider.providerLocalData);
                        if (result) {
                            finalResult.push(...result);
                        }
                    }
                }
            } catch (err) {
                logger.error(err);
            }
        }
        await new MainListAdder().addSeries(...this.seriesThatShouldAdded);
        return finalResult;
    }

    public async requestSeasonAwarnessForProviderLocalData(series: Series, extraInfoProviders: ProviderLocalDataWithSeasonInfo[], providerWithoutSeasonAwarness: ProviderLocalData): Promise<ProviderLocalDataWithSeasonInfo[]> {
        let finalSeason: Season | undefined;
        const targetSeason = series.getProviderSeasonTarget(providerWithoutSeasonAwarness.provider);

        if (!EpisodeHelper.hasEpisodeNames(providerWithoutSeasonAwarness.detailEpisodeInfo)) {
            // tslint:disable-next-line: max-line-length
            const result: ProviderLocalData | undefined = await ProviderHelper.simpleProviderLocalDataUpgradeRequest([providerWithoutSeasonAwarness], ProviderList.getExternalProviderInstance(providerWithoutSeasonAwarness));
            if (result !== undefined) {
                providerWithoutSeasonAwarness = result;
            }
        }

        if (!seasonHelper.isSeasonUndefined(targetSeason)) {
            finalSeason = targetSeason as Season;
        } else {
            finalSeason = await series.getSeason();
        }
        const allProviders = [...series.getAllProviderLocalDatas(), ...extraInfoProviders.map((x) => x.providerLocalData)];
        const externalProviders = this.getAllExternalProvidersThatCanHelpToCreateSeasonAwarness();

        for (const externalProvider of externalProviders) {
            if (providerWithoutSeasonAwarness.provider !== externalProvider.providerName) {
                const providerLocalData = await this.getValidProviderLocalData(allProviders, series, externalProvider);
                if (providerLocalData) {
                    const result = await this.newCreateAwareness(providerLocalData, providerWithoutSeasonAwarness, finalSeason);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        return [];
    }

    private async getValidProviderLocalData(allProviders: ProviderLocalData[], series: Series, externalProvider: ExternalInformationProvider) {
        let providerLocalData = allProviders.find((x) => x.provider === externalProvider.providerName);
        if (!providerLocalData) {
            providerLocalData = await this.getProviderLocalDataFromFirstSeason(series, externalProvider);
        }
        if (!providerLocalData) {
            providerLocalData = await ProviderHelper.simpleProviderLocalDataUpgradeRequest(allProviders, externalProvider);
        }
        if (!providerLocalData) {
            let names = series.getAllNames();
            names = TitleHelper.getAllNamesSortedBySearchAbleScore(names);
            const result = await providerInfoDownloaderhelper.downloadProviderSeriesInfoBySeriesName(names, series, externalProvider);
            providerLocalData = result?.mainProvider.providerLocalData;
        }
        return providerLocalData;
    }

    private async getProviderLocalDataFromFirstSeason(series: Series, providerInstance: ExternalProvider): Promise<ProviderLocalData | undefined> {
        logger.debug('[SeasonAwarenessCreatorSeasonNumber] [getProviderLocalDataFromFirstSeason] for provider instance: ' + providerInstance.providerName);
        try {
            return (await series.getFirstSeason()).getProviderLocalData(providerInstance);
        } catch (err) {
            logger.debug(err);
            return undefined;
        }
    }

    private async newCreateAwareness(providerThatHasAwarenss: ProviderLocalData, providerThatDontHaveAwareness: ProviderLocalData, targetSeason: Season): Promise<ProviderLocalDataWithSeasonInfo[]> {
        let currentProviderThatHasAwareness: ProviderLocalData | undefined = { ...providerThatHasAwarenss } as ProviderLocalData;
        currentProviderThatHasAwareness = await this.updateProvider(currentProviderThatHasAwareness);

        if (EpisodeHelper.hasEpisodeNames(currentProviderThatHasAwareness.detailEpisodeInfo)) {
            const result = new EpisodeRelationAnalyser(providerThatDontHaveAwareness.detailEpisodeInfo, currentProviderThatHasAwareness.detailEpisodeInfo);
            const seasonResult = await this.resultManager(result, currentProviderThatHasAwareness, providerThatDontHaveAwareness, targetSeason);
            return [new ProviderLocalDataWithSeasonInfo(providerThatDontHaveAwareness, seasonResult), new ProviderLocalDataWithSeasonInfo(currentProviderThatHasAwareness, seasonResult)];
        }
        return [];
    }

    private async resultManager(result: EpisodeRelationAnalyser, providerThatHasAwarenss: ProviderLocalData, providerThatDonthaveAwareness: ProviderLocalData, targetSeason: Season): Promise<Season | undefined> {
        if (targetSeason.isSeasonUndefined() || SeasonComperator.isSameSeasonNumber(new Season(result.finalSeasonNumbers), targetSeason)) {
            if (result.finalSeasonNumbers !== undefined && result.seasonComplete) {
                return new Season(result.finalSeasonNumbers);
            } else if (result.finalSeasonNumbers?.length === 1 && result.minEpisodeNumberOfSeasonHolder !== 1) {
                const prequelSeason = await this.processPrequel(providerThatHasAwarenss, providerThatDonthaveAwareness, targetSeason);
                if (SeasonComperator.isSameSeasonNumber(prequelSeason[0].seasonTarget, new Season(result.finalSeasonNumbers))) {
                    let newSeasonpart = prequelSeason[0].seasonTarget?.seasonPart;
                    if (newSeasonpart !== undefined) {
                        newSeasonpart++;
                    }
                    return new Season(prequelSeason[0].seasonTarget?.seasonNumbers, newSeasonpart);
                }

            } else if (result.finalSeasonNumbers?.length === 1 && result.minEpisodeNumberOfSeasonHolder === 1) {
                return new Season(result.finalSeasonNumbers, 1);
            } else {
                logger.error('SEASON IS NOT COMPLETE CANT EXTRACT SEASON NUMBER !!!');
                throw new Error('Failed to get Season');
            }
        } else {
            const sequelResult = await this.processSequel(providerThatHasAwarenss, providerThatDonthaveAwareness, targetSeason);
            return sequelResult[0].seasonTarget;
        }
    }

    private async processPrequel(providerThatHasAwareness: ProviderLocalData, providerThatDontHaveAwareness: ProviderLocalData, targetSeason: Season): Promise<ProviderLocalDataWithSeasonInfo[]> {
        if (providerThatHasAwareness.prequelIds.length !== 0) {
            const prequels = this.getPrequelProviderLocalDatas(providerThatHasAwareness, providerThatHasAwareness.provider);
            for (const prequel of prequels) {
                try {
                    const result = await this.newCreateAwareness(prequel, providerThatDontHaveAwareness, targetSeason);
                    if (result.length !== 0) {
                        return result;
                    }
                } catch (err) {
                    logger.debug('[SeasonAwarenessCreatorSeason] Sequel processing error:');
                    logger.debug(err);
                }
            }
        }
        throw new Error('no prequel avaible for provider: ' + providerThatHasAwareness.provider);

    }


    private async processSequel(providerThatHasAwareness: ProviderLocalData, providerThatDontHaveAwareness: ProviderLocalData, targetSeason: Season): Promise<ProviderLocalDataWithSeasonInfo[]> {
        if (providerThatHasAwareness.sequelIds.length !== 0) {
            const sequels = this.getSequelProviderLocalDatas(providerThatHasAwareness, providerThatHasAwareness.provider);
            for (const sequel of sequels) {
                try {
                    const result = await this.newCreateAwareness(sequel, providerThatDontHaveAwareness, targetSeason);
                    if (result.length !== 0) {
                        return result;
                    }
                } catch (err) {
                    logger.debug('[SeasonAwarenessCreatorSeason] Sequel processing error:');
                    logger.debug(err);
                }
            }
        }
        throw new Error('no sequel avaible for provider: ' + providerThatHasAwareness.provider);
    }

    private async updateProvider(providerLocalData: ProviderLocalData): Promise<ProviderLocalData> {
        let currentProviderThatHasAwareness = providerLocalData;
        if (!EpisodeHelper.hasEpisodeNames(currentProviderThatHasAwareness.detailEpisodeInfo)) {
            const currentProviderThatHasAwarenessProvider = ProviderList.getExternalProviderInstance(currentProviderThatHasAwareness);
            // tslint:disable-next-line: max-line-length
            const result: ProviderLocalData | undefined = await ProviderHelper.simpleProviderLocalDataUpgradeRequest([currentProviderThatHasAwareness], currentProviderThatHasAwarenessProvider);
            if (result !== undefined) {
                currentProviderThatHasAwareness = result;
            }
        }
        return currentProviderThatHasAwareness;
    }

    private getSequelProviderLocalData(provider: ProviderLocalData, providerName: string): ProviderLocalData | undefined {
        for (const sequelId of provider.sequelIds) {
            if (provider.instanceName === 'InfoProviderLocalData') {
                return new InfoProviderLocalData(sequelId, providerName);
            } else if (provider.instanceName === 'ListProviderLocalData') {
                return new ListProviderLocalData(sequelId, providerName);
            }
        }
        return undefined;
    }

    private getSequelProviderLocalDatas(provider: ProviderLocalData, providerName: string): ProviderLocalData[] {
        const sequels = [];
        for (const sequelId of provider.sequelIds) {
            if (provider.instanceName === 'InfoProviderLocalData') {
                sequels.push(new InfoProviderLocalData(sequelId, providerName));
            } else if (provider.instanceName === 'ListProviderLocalData') {
                sequels.push(new ListProviderLocalData(sequelId, providerName));
            }
        }
        return sequels;
    }

    private getPrequelProviderLocalDatas(provider: ProviderLocalData, providerName: string): ProviderLocalData[] {
        const prequels = [];
        for (const prequelId of provider.prequelIds) {
            if (provider.instanceName === 'InfoProviderLocalData') {
                prequels.push(new InfoProviderLocalData(prequelId, providerName));
            } else if (provider.instanceName === 'ListProviderLocalData') {
                prequels.push(new ListProviderLocalData(prequelId, providerName));
            }
        }
        return prequels;
    }


    private calcNewSeasonPartNumber(result: EpisodeRelationAnalyser, currentSeasonPart?: number): number | undefined {
        if (result.seasonComplete) {
            if (currentSeasonPart !== undefined) {
                currentSeasonPart++;
            }
        } else {
            if (currentSeasonPart === undefined) {
                currentSeasonPart = 1;
            } else {
                currentSeasonPart++;
            }
        }

        return currentSeasonPart;
    }

    private async createTempSeries(listLocalData: ProviderLocalData, currentLocalData: ProviderLocalData, season: Season): Promise<Series> {
        const newSeries = new Series();
        await newSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(listLocalData, season));
        await newSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(currentLocalData, season));
        return newSeries;
    }

    private getAllExternalProvidersThatCanHelpToCreateSeasonAwarness(): ExternalInformationProvider[] {
        const result = [];
        for (const externalProvider of ProviderList.getAllExternalInformationProvider()) {
            if (externalProvider.hasEpisodeTitleOnFullInfo) {
                result.push(externalProvider);
            }
        }
        return result;
    }


}
