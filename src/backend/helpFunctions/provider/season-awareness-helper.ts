import Series from "../../controller/objects/series";
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import Season from '../../controller/objects/meta/season';
import ProviderDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info';
import ProviderList from '../../controller/provider-manager/provider-list';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import EpisodeHelper from '../episode-helper/episode-helper';
import MainListAdder from '../../controller/main-list-manager/main-list-adder';
import logger from '../../logger/logger';
import EpisodeRelationResult from '../episode-helper/episode-relation-result';
import ExternalProvider from '../../api/provider/external-provider';
import { ProviderHelper } from './provider-helper';

export default class SeasonAwarenessHelper {
    private currentSearchingSeason: number = 1;
    private currentSeasonPart: number | undefined = undefined;
    private seriesThatShouldAdded: Series[] = [];
    private finalList: ProviderDataWithSeasonInfo[] = [];
    private series: Series;
    private extraInfoProviders: ProviderDataWithSeasonInfo[];

    constructor(series: Series, extraInfoProviders: ProviderDataWithSeasonInfo[]) {
        this.series = series;
        this.extraInfoProviders = extraInfoProviders;
    }
    public async requestSeasonAwareness(): Promise<ProviderDataWithSeasonInfo[]> {
        const finalList: ProviderDataWithSeasonInfo[] = [];
        if (this.isSeriesAbleToCreateSeasonAwareness(this.series, this.extraInfoProviders)) {
            for (const listProvider of this.series.getListProvidersInfos()) {
                const targetSeason = this.series.getProviderSeasonTarget(listProvider.provider);
                if (targetSeason !== undefined && targetSeason.seasonNumber !== undefined) {
                    finalList.push(...await this.createSeasonAwareness(this.series, listProvider, targetSeason));
                }
            }
            return finalList;
        } else {
            return this.extraInfoProviders;
        }
    }

    private async createSeasonAwareness(series: Series, listLocalData: ListProviderLocalData, targetSeason: Season) {
        const infoProviderLocalDatas = [...series.getInfoProvidersInfos()];
        this.currentSearchingSeason = 1;
        this.currentSeasonPart = undefined;
        for (const infoLocalData of infoProviderLocalDatas) {
            let currentLocalData: InfoProviderLocalData | null = infoLocalData;
            do {
                try {
                    const providerInstance = ProviderList.getExternalProviderInstance(currentLocalData);
                    if (providerInstance.hasEpisodeTitleOnFullInfo) {
                        currentLocalData = await this.calcSeasonAwareness(currentLocalData, listLocalData, providerInstance, targetSeason);
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

    private async calcSeasonAwareness(currentLocalData: InfoProviderLocalData | null, listLocalData: ListProviderLocalData, providerInstance: ExternalProvider, targetSeason: Season) {
        let infoLocalData: InfoProviderLocalData | null = currentLocalData;
        if (currentLocalData !== null) {
            infoLocalData = await new ProviderHelper().simpleProviderInfoRequest(currentLocalData, providerInstance) as InfoProviderLocalData | null;
            currentLocalData = null;
            if (infoLocalData && EpisodeHelper.hasEpisodeNames(infoLocalData.detailEpisodeInfo)) {
                const result = EpisodeHelper.calculateRelationBetweenEpisodes(listLocalData.detailEpisodeInfo, infoLocalData.detailEpisodeInfo);
                this.currentSeasonPart = this.calcNewSeasonPartNumber(result, this.currentSeasonPart);
                const newSeries = await this.createTempSeries(listLocalData, infoLocalData, new Season(this.currentSearchingSeason, this.currentSeasonPart));

                if (result.seasonComplete) {
                    if (targetSeason.seasonNumber === this.currentSearchingSeason) {
                        this.finalList.push(new ProviderDataWithSeasonInfo(infoLocalData, new Season(this.currentSearchingSeason, this.currentSeasonPart)));
                    } else {
                        this.seriesThatShouldAdded.push(newSeries);
                    }
                    this.currentSearchingSeason++;
                    this.currentSeasonPart = undefined
                } else {
                    this.seriesThatShouldAdded.push(newSeries);
                }

                for (const sequelId of infoLocalData.sequelIds) {
                    const sequelproviderInstance = new InfoProviderLocalData(sequelId, infoLocalData.provider);
                    currentLocalData = sequelproviderInstance;
                }
            } else {
                currentLocalData = null;
            }
        }
        return currentLocalData;
    }

    private async createTempSeries(listLocalData: ListProviderLocalData, infoLocalData: InfoProviderLocalData, season: Season): Promise<Series> {
        const newSeries = new Series();
        await newSeries.addListProvider(listLocalData, season);
        await newSeries.addInfoProvider(infoLocalData, season);
        return newSeries;
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
