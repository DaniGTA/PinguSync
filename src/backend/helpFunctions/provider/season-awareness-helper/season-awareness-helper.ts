import ExternalProvider from '../../../api/provider/external-provider';
import MainListAdder from '../../../controller/main-list-manager/main-list-adder';
import Season from '../../../controller/objects/meta/season';
import Series from '../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-manager/provider-list';
import logger from '../../../logger/logger';
import EpisodeHelper from '../../episode-helper/episode-helper';
import EpisodeRelationResult from '../../episode-helper/episode-relation-result';
import ProviderHelper from '../provider-helper';
import ProviderDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';
import providerInfoDownloaderhelper from '../provider-info-downloader/provider-info-downloaderhelper';

export default class SeasonAwarenessHelper {

    public static isSeasonAware(currentProviders: ProviderDataWithSeasonInfo[]): boolean {
        for (const provider of currentProviders) {
            try {
                if (!SeasonAwarenessHelper.isProviderSeasonAware(provider)) {
                    return false;
                }
            } catch (err) {
                logger.debug(err);
            }
        }
        return true;
    }

    public static isProviderSeasonAware(provider: ProviderDataWithSeasonInfo) {
        if (!ProviderList.getExternalProviderInstance(provider.providerLocalData).hasUniqueIdForSeasons && (provider.seasonTarget?.seasonNumber !== 1)) {
            return false;
        }
        return true;
    }
    private currentSearchingSeason: number = 1;
    private currentSeasonPart: number | undefined = undefined;
    private seriesThatShouldAdded: Series[] = [];
    private finalList: ProviderDataWithSeasonInfo[] = [];
    private series: Series;
    private extraInfoProviders: ProviderDataWithSeasonInfo[];

    constructor(series: Series, extraInfoProviders?: ProviderDataWithSeasonInfo[]) {
        this.series = series;
        this.extraInfoProviders = extraInfoProviders ? extraInfoProviders : [];
    }
    public async requestSeasonAwareness(): Promise<ProviderDataWithSeasonInfo[]> {
        const finalList: ProviderDataWithSeasonInfo[] = [];
        for (const listProvider of this.series.getListProvidersInfosWithSeasonInfo()) {
            if (ProviderList.getExternalProviderInstance(listProvider.providerLocalData).hasEpisodeTitleOnFullInfo) {
                if (!SeasonAwarenessHelper.isProviderSeasonAware(listProvider)) {
                    try {
                        const list = await this.requestSeasonAwarnessForProviderLocalData(listProvider.providerLocalData);
                        finalList.push(...list);
                    } catch (err) {
                        logger.error(err);
                    }
                }
            }
        }
        return finalList;
    }

    public async requestSeasonAwarnessForProviderLocalData(provider: ProviderLocalData): Promise<ProviderDataWithSeasonInfo[]> {
        let finalSeason: Season | undefined;
        const targetSeason = this.series.getProviderSeasonTarget(provider.provider);
        if (targetSeason !== undefined && targetSeason.seasonNumber !== undefined) {
            finalSeason = targetSeason;
        } else {
            finalSeason = await this.series.getSeason();
        }
        this.finalList = [];
        this.seriesThatShouldAdded = [];
        return this.createSeasonAwareness(provider, finalSeason);
    }

    public async requestSeasonAwarnessForProvider(provider: ExternalProvider) {
        const localDataInfoResult = await providerInfoDownloaderhelper.downloadProviderSeriesInfo(this.series, provider);
        return this.requestSeasonAwarnessForProviderLocalData(localDataInfoResult.mainProvider.providerLocalData);
    }

    private async createSeasonAwareness(targetProviderLocalData: ProviderLocalData, targetSeason: Season): Promise<ProviderDataWithSeasonInfo[]> {

        this.currentSearchingSeason = 1;
        this.currentSeasonPart = undefined;
        for (const infoLocalData of SeasonAwarenessHelper.getOtherProvidersWithSeasonAwareness(this.series, targetProviderLocalData)) {
            let currentLocalData: ProviderLocalData | null = infoLocalData;
            do {
                try {
                    const providerInstance = ProviderList.getExternalProviderInstance(currentLocalData);
                    if (providerInstance.hasEpisodeTitleOnFullInfo) {
                        currentLocalData = await this.calcSeasonAwareness(currentLocalData, targetProviderLocalData, providerInstance, targetSeason);
                    } else {
                        currentLocalData = null;
                    }
                } catch (err) {
                    logger.debug(err);
                    currentLocalData = null;
                }
            } while (currentLocalData !== null);
        }
        await new MainListAdder().addSeries(...this.seriesThatShouldAdded);
        return this.finalList;
    }

    public static getOtherProvidersWithSeasonAwareness(series: Series, filterOut: ProviderLocalData): ProviderLocalData[] {
        const collectedProviders: ProviderLocalData[] = [];
        const allProviders = series.getAllProviderLocalDatas();
        for (const providerLocalData of allProviders) {
            if (providerLocalData.provider !== filterOut.provider) {
                try {
                    if (ProviderList.getExternalProviderInstance(providerLocalData).hasEpisodeTitleOnFullInfo) {
                        collectedProviders.push(providerLocalData);
                    }
                } catch (err) {
                    logger.debug(err);
                }
            }
        }
        return collectedProviders;
    }

    private async calcSeasonAwareness(inputCurrentLocalData: ProviderLocalData, listLocalData: ProviderLocalData, providerInstance: ExternalProvider, targetSeason: Season) {
        let currentLocalData: ProviderLocalData | null = { ...inputCurrentLocalData } as ProviderLocalData
        let currentProviderLocalData: ProviderLocalData | null = { ...currentLocalData } as ProviderLocalData;
        if (currentLocalData !== null && EpisodeHelper.hasEpisodeNames(listLocalData.detailEpisodeInfo)) {
            currentProviderLocalData = await ProviderHelper.simpleProviderInfoRequest(currentLocalData, providerInstance) as InfoProviderLocalData | null;
            currentLocalData = null;
            if (currentProviderLocalData && EpisodeHelper.hasEpisodeNames(currentProviderLocalData.detailEpisodeInfo)) {
                const result = EpisodeHelper.calculateRelationBetweenEpisodes(listLocalData.detailEpisodeInfo, currentProviderLocalData.detailEpisodeInfo);
                this.currentSeasonPart = this.calcNewSeasonPartNumber(result, this.currentSeasonPart);
                const newSeries = await this.createTempSeries(listLocalData, currentProviderLocalData, new Season(this.currentSearchingSeason, this.currentSeasonPart));

                if (result.seasonComplete) {
                    if (targetSeason.seasonNumber === this.currentSearchingSeason) {
                        this.finalList.push(new ProviderDataWithSeasonInfo(currentProviderLocalData, new Season(this.currentSearchingSeason, this.currentSeasonPart)));
                        return null;
                    } else {
                        this.seriesThatShouldAdded.push(newSeries);
                    }
                    this.currentSearchingSeason++;
                    this.currentSeasonPart = undefined;
                } else {
                    this.seriesThatShouldAdded.push(newSeries);
                }

                for (const sequelId of currentProviderLocalData.sequelIds) {
                    const sequelproviderInstance = new InfoProviderLocalData(sequelId, currentProviderLocalData.provider);
                    currentLocalData = sequelproviderInstance;
                }
            } else {
                currentLocalData = null;
            }
        } else {
            currentLocalData = null;
        }
        return currentLocalData;
    }

    private async createTempSeries(listLocalData: ProviderLocalData, currentLocalData: ProviderLocalData, season: Season): Promise<Series> {
        const newSeries = new Series();
        await newSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(listLocalData, season));
        await newSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(currentLocalData, season));
        return newSeries;
    }

    public calcNewSeasonPartNumber(result: EpisodeRelationResult, currentSeasonPart?: number): number | undefined {
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

    private isSeriesAbleToCreateSeasonAwareness(series: Series, extraInfoProviders: ProviderDataWithSeasonInfo[]): boolean {
        const listProviders = series.getListProvidersInfos();
        const infoProviders = [...series.getInfoProvidersInfos(), ...(extraInfoProviders).flatMap((x) => x.providerLocalData)];
        let listResult = false;
        let infoResult = false;
        for (const listProvider of listProviders) {
            try {
                if (ProviderList.getExternalProviderInstance(listProvider).hasEpisodeTitleOnFullInfo) {
                    listResult = true;
                }
            } catch (err) {
                logger.debug('isSeriesAbleToCreateSeasonAwareness for loop #1 error:');
                logger.debug(err);
            }
        }

        for (const infoProvider of infoProviders) {
            try {
                if (ProviderList.getExternalProviderInstance(infoProvider).hasEpisodeTitleOnFullInfo) {
                    infoResult = true;
                }
            } catch (err) {
                logger.debug('isSeriesAbleToCreateSeasonAwareness for loop #2 error:');
                logger.debug(err);
            }
        }
        return listResult && infoResult;
    }
}
