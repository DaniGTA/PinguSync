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
import listHelper from '../../list-helper';
import TitleHelper from '../../name-helper/title-helper';
import seasonHelper from '../../season-helper/season-helper';
import ProviderHelper from '../provider-helper';
import ProviderLocalDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';
import providerInfoDownloaderhelper from '../provider-info-downloader/provider-info-downloaderhelper';
import SeasonAwarenessHelper from './season-awareness-helper';

export default class SeasonAwarenessCreatorSeasonNumber {
    private finalList: ProviderLocalDataWithSeasonInfo[] = [];
    private seriesThatShouldAdded: Series[] = [];
    public async requestSeasonAwareness(series: Series, extraInfoProviders: ProviderLocalDataWithSeasonInfo[] = []): Promise<ProviderLocalDataWithSeasonInfo[]> {
        for (const listProvider of series.getListProvidersLocalDataInfosWithSeasonInfo()) {
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

    public async requestSeasonAwarnessForProviderLocalData(series: Series, extraInfoProviders: ProviderLocalDataWithSeasonInfo[], providerWithoutSeasonAwarness: ProviderLocalData): Promise<void> {
        let finalSeason: Season | undefined;
        const targetSeason = series.getProviderSeasonTarget(providerWithoutSeasonAwarness.provider);

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
                    const result = await this.createAwareness(providerLocalData, providerWithoutSeasonAwarness, finalSeason);
                    if (result) {
                        return;
                    }
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

    private async createAwareness(providerThatHasAwarenss: ProviderLocalData, providerThatDontHaveAwareness: ProviderLocalData, targetSeason: Season): Promise<ProviderLocalDataWithSeasonInfo | undefined> {
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
                if (result.seasonNumber && result.seasonNumber.length !== 0) {
                    currentSearchingSeason = result.seasonNumber[result.seasonNumber.length - 1];
                } else {
                    currentSearchingSeason = undefined;
                }
                currentSeasonPart = this.calcNewSeasonPartNumber(result, currentSeasonPart);
                const newSeries = [];
                newSeries.push(await this.createTempSeries(providerThatDontHaveAwareness, currentProviderThatHasAwareness, new Season(result.seasonNumber, currentSeasonPart)));

                if (result.seasonComplete) {
                    if (currentSearchingSeason !== undefined && ((targetSeason.seasonNumbers.includes(currentSearchingSeason)) ||
                        (result.seasonNumber !== undefined && listHelper.isAnySeasonNumberListEntryInSeasonNumberList(result.seasonNumber, targetSeason.seasonNumbers)))) {
                        const pdwsi = new ProviderLocalDataWithSeasonInfo(providerThatDontHaveAwareness, new Season([currentSearchingSeason], currentSeasonPart));
                        const pdwsi2 = new ProviderLocalDataWithSeasonInfo(currentProviderThatHasAwareness, new Season([currentSearchingSeason], currentSeasonPart));
                        this.finalList.push(pdwsi, pdwsi2);
                        return pdwsi;
                    } else if ((seasonHelper.isSeasonUndefined(targetSeason) &&
                        result.seasonComplete &&
                        result.seasonNumber !== undefined &&
                        result.seasonNumber.length !== 0)) {
                        const pdwsi = new ProviderLocalDataWithSeasonInfo(providerThatDontHaveAwareness, new Season(result.seasonNumber, currentSeasonPart));
                        const pdwsi2 = new ProviderLocalDataWithSeasonInfo(currentProviderThatHasAwareness, new Season(result.seasonNumber, currentSeasonPart));
                        this.finalList.push(pdwsi, pdwsi2);
                        return pdwsi;
                    } else {
                        this.seriesThatShouldAdded.push(...newSeries);
                    }
                    if (currentSearchingSeason) {
                        currentSearchingSeason++;
                    }
                    currentSeasonPart = undefined;
                } else {
                    this.seriesThatShouldAdded.push(...newSeries);
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
        await newSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(listLocalData, season));
        await newSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(currentLocalData, season));
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
