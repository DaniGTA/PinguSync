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
import EpisodeRelationResult from '../../episode-helper/episode-relation-result';
import TitleHelper from '../../name-helper/title-helper';
import ProviderHelper from '../provider-helper';
import ProviderDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';
import providerInfoDownloaderhelper from '../provider-info-downloader/provider-info-downloaderhelper';
import SeasonAwarenessHelper from './season-awareness-helper';

export default class SeasonAwarenessCreatorSeasonNumber {
    private finalList: ProviderDataWithSeasonInfo[] = [];
    private seriesThatShouldAdded: Series[] = [];
    public async requestSeasonAwareness(series: Series, extraInfoProviders: ProviderDataWithSeasonInfo[] = []): Promise<ProviderDataWithSeasonInfo[]> {
        for (const listProvider of series.getListProvidersInfosWithSeasonInfo()) {
            if (ProviderList.getExternalProviderInstance(listProvider.providerLocalData).hasEpisodeTitleOnFullInfo) {
                if (!SeasonAwarenessHelper.isProviderSeasonAware(listProvider)) {
                    try {
                        await this.requestSeasonAwarnessForProviderLocalData(series, extraInfoProviders, listProvider.providerLocalData);
                    } catch (err) {
                        logger.error(err);
                    }
                }
            }
        }
        await new MainListAdder().addSeries(...this.seriesThatShouldAdded);
        return this.finalList;
    }

    public async requestSeasonAwarnessForProviderLocalData(series: Series, extraInfoProviders: ProviderDataWithSeasonInfo[], providerWithoutSeasonAwarness: ProviderLocalData): Promise<void> {
        let finalSeason: Season | undefined;
        const targetSeason = series.getProviderSeasonTarget(providerWithoutSeasonAwarness.provider);

        if (targetSeason !== undefined && targetSeason.seasonNumber !== undefined) {
            finalSeason = targetSeason;
        } else {
            finalSeason = await series.getSeason();
        }
        const allProviders = [...series.getAllProviderLocalDatas(), ...extraInfoProviders.map((x) => x.providerLocalData)];
        const externalProviders = this.getAllExternalProvidersThatCanHelpToCreateSeasonAwarness();

        for (const externalProvider of externalProviders) {
            const providerLocalData = await this.getValidProviderLocalData(allProviders, series, externalProvider);
            if (providerLocalData) {
                const result = await this.createAwareness(providerLocalData, providerWithoutSeasonAwarness, finalSeason);
                if (result) {
                    return;
                }
            }
        }
    }

    private async getValidProviderLocalData(allProviders: ProviderLocalData[], series: Series, externalProvider: ExternalProvider) {
        let providerLocalData = allProviders.find((x) => x.provider === externalProvider.providerName);
        if (!providerLocalData) {
            providerLocalData = await this.getProviderLocalDataFromFirstSeason(series, externalProvider);
        }
        if (!providerLocalData) {
            providerLocalData = await ProviderHelper.simpleProviderInfoRequest(allProviders, externalProvider);
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

    private async createAwareness(providerThatHasAwarenss: ProviderLocalData, providerThatDontHaveAwareness: ProviderLocalData, targetSeason: Season): Promise<ProviderDataWithSeasonInfo | undefined> {
        let currentSeasonPart;
        let currentSearchingSeason;
        let currentProviderThatHasAwareness: ProviderLocalData | undefined = { ...providerThatHasAwarenss } as ProviderLocalData;
        while (currentProviderThatHasAwareness) {
            const currentProviderThatHasAwarenessProvider = ProviderList.getExternalProviderInstance(currentProviderThatHasAwareness);
            if (!EpisodeHelper.hasEpisodeNames(currentProviderThatHasAwareness.detailEpisodeInfo)) {
                // tslint:disable-next-line: max-line-length
                const result: ProviderLocalData | undefined = await ProviderHelper.simpleProviderInfoRequest([currentProviderThatHasAwareness], currentProviderThatHasAwarenessProvider);
                if (result !== undefined) {
                    currentProviderThatHasAwareness = result;
                }
            }
            if (EpisodeHelper.hasEpisodeNames(currentProviderThatHasAwareness.detailEpisodeInfo)) {
                const result = EpisodeHelper.calculateRelationBetweenEpisodes(providerThatDontHaveAwareness.detailEpisodeInfo, currentProviderThatHasAwareness.detailEpisodeInfo);
                currentSearchingSeason = result.seasonNumber;
                currentSeasonPart = this.calcNewSeasonPartNumber(result, currentSeasonPart);
                const newSeries = await this.createTempSeries(providerThatDontHaveAwareness, currentProviderThatHasAwareness, new Season(currentSearchingSeason, currentSeasonPart));

                if (result.seasonComplete) {
                    if (targetSeason.seasonNumber === currentSearchingSeason) {
                        const pdwsi = new ProviderDataWithSeasonInfo(providerThatDontHaveAwareness, new Season(currentSearchingSeason, currentSeasonPart));
                        const pdwsi2 = new ProviderDataWithSeasonInfo(currentProviderThatHasAwareness);
                        this.finalList.push(pdwsi, pdwsi2);
                        return pdwsi;
                    } else {
                        this.seriesThatShouldAdded.push(newSeries);
                    }
                    if (currentSearchingSeason) {
                        currentSearchingSeason++;
                    }
                    currentSeasonPart = undefined;
                } else {
                    this.seriesThatShouldAdded.push(newSeries);
                }
                const current = this.getSequelProviderLocalData(currentProviderThatHasAwareness, currentProviderThatHasAwarenessProvider.providerName);
                if (current) {
                    currentProviderThatHasAwareness = current;
                    continue;
                }

            }

            currentProviderThatHasAwareness = undefined;
        }
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

    private calcNewSeasonPartNumber(result: EpisodeRelationResult, currentSeasonPart?: number): number | undefined {
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
        await newSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(listLocalData, season));
        await newSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(currentLocalData, season));
        return newSeries;
    }

    private getAllExternalProvidersThatCanHelpToCreateSeasonAwarness(): ExternalProvider[] {
        const result = [];
        for (const externalProvider of ProviderList.getAllProviderLists()) {
            if (externalProvider.hasEpisodeTitleOnFullInfo) {
                result.push(externalProvider);
            }
        }
        return result;
    }


}
