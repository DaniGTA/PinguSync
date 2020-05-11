import ExternalInformationProvider from '../../../api/provider/external-information-provider';
import ExternalProvider from '../../../api/provider/external-provider';
import MainListAdder from '../../../controller/main-list-manager/main-list-adder';
import Season from '../../../controller/objects/meta/season';
import Series from '../../../controller/objects/series';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list';
import logger from '../../../logger/logger';
import EpisodeHelper from '../../episode-helper/episode-helper';
import TitleHelper from '../../name-helper/title-helper';
import seasonHelper from '../../season-helper/season-helper';
import ProviderHelper from '../provider-helper';
import DownloadProviderLocalDataWithoutId from '../provider-info-downloader/download-provider-local-data-without-id';
import ProviderLocalDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';
import SeasonAwarenessHelper from './season-awareness-helper';
import SeasonAwarenessPathController from './season-awareness-path-controller';

export default class SeasonAwarenessCreatorSeasonNumber {
    private seriesThatShouldAdded: Series[] = [];
    public async requestSeasonAwareness(
        series: Series, extraInfoProviders: ProviderLocalDataWithSeasonInfo[] = []): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const finalResult: ProviderLocalDataWithSeasonInfo[] = [];
        for (const listProvider of series.getListProvidersLocalDataInfosWithSeasonInfo()) {
            try {
                if (ProviderList.getProviderInstanceByLocalData(listProvider.providerLocalData).hasEpisodeTitleOnFullInfo) {
                    if (SeasonAwarenessHelper.canCreateSeasonAwareness(listProvider)) {
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

    public async requestSeasonAwarnessForProviderLocalData(
        series: Series, extraInfoProviders: ProviderLocalDataWithSeasonInfo[],
        providerWithoutSeasonAwarness: ProviderLocalData): Promise<ProviderLocalDataWithSeasonInfo[]> {
        let finalSeason: Season | undefined;
        const targetSeason = series.getProviderSeasonTarget(providerWithoutSeasonAwarness.provider);
        if (!EpisodeHelper.hasEpisodeNames(providerWithoutSeasonAwarness.detailEpisodeInfo)) {
            // tslint:disable-next-line: max-line-length
            const result: ProviderLocalData | undefined = await ProviderHelper.simpleProviderLocalDataUpgradeRequest([providerWithoutSeasonAwarness], ProviderList.getProviderInstanceByLocalData(providerWithoutSeasonAwarness));
            if (result !== undefined) {
                providerWithoutSeasonAwarness = result;
            }
        }

        if (!seasonHelper.isSeasonUndefined(targetSeason)) {
            finalSeason = targetSeason as Season;
        }
        const allProviders = [...series.getAllProviderLocalDatas(), ...extraInfoProviders.map((x) => x.providerLocalData)];
        const externalProviders = this.getAllExternalProvidersThatCanHelpToCreateSeasonAwarness();

        for (const externalProvider of externalProviders) {
            try {
                if (providerWithoutSeasonAwarness.provider !== externalProvider.providerName) {
                    const providerLocalData = await this.getValidProviderLocalData(allProviders, series, externalProvider, finalSeason !== undefined);
                    if (providerLocalData) {
                        const result = await this.getSeasonForProviderThatDontHaveSeason(providerLocalData, providerWithoutSeasonAwarness, finalSeason);
                        if (result) {
                            return result;
                        }
                    }
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return [];
    }

    private async getValidProviderLocalData(allProviders: ProviderLocalData[], series: Series, externalProvider: ExternalInformationProvider, firstSeasonAllowed: boolean): Promise<ProviderLocalData | undefined> {
        let providerLocalData = allProviders.find((x) => x.provider === externalProvider.providerName);
        if (!providerLocalData && firstSeasonAllowed) {
            providerLocalData = await this.getProviderLocalDataFromFirstSeason(series, externalProvider);
        }
        if (!providerLocalData) {
            providerLocalData = await ProviderHelper.simpleProviderLocalDataUpgradeRequest(allProviders, externalProvider);
        }
        if (!providerLocalData) {
            try {
                let names = series.getAllNames();
                names = TitleHelper.getAllNamesSortedBySearchAbleScore(names);
                const result = await new DownloadProviderLocalDataWithoutId(series, externalProvider).downloadProviderSeriesInfoBySeriesName(names);
                providerLocalData = result?.mainProvider.providerLocalData;
            } catch (err) {
                logger.error(err);
            }
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


    private async getSeasonForProviderThatDontHaveSeason(
        providerThatHasAwarenss: ProviderLocalData,
        providerThatDontHaveAwareness: ProviderLocalData, targetSeason: Season | undefined): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const createSeasonInstance = new SeasonAwarenessPathController(providerThatHasAwarenss, providerThatDontHaveAwareness, targetSeason);
        const result = createSeasonInstance.getSeasonAwarnessResult(targetSeason);
        return result;
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
