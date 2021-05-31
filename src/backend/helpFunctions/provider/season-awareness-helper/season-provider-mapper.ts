import InfoProvider from '../../../api/provider/info-provider'
import ListProvider from '../../../api/provider/list-provider'
import Season from '../../../controller/objects/meta/season'
import Series from '../../../controller/objects/series'
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list'
import logger from '../../../logger/logger'
import SeasonComperator from '../../comperators/season-comperator'
import EpisodeHelper from '../../episode-helper/episode-helper'
import EpisodeRelationAnalyser from '../../episode-helper/episode-relation-analyser'
import ProviderLocalDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info'
import SeasonAwarenessData from './season-awareness-data'
import SeasonAwarenessHelper from './season-awareness-helper'
import SeasonAwarenessResult from './season-awareness-result'
import { SeasonAwarenessPath } from './season-awarness-path'

export default class SeasonProviderMapper {
    private seasonAD: SeasonAwarenessData
    private scanHistory: string[] = []

    constructor(
        pWithAwareness: ProviderLocalData,
        pWithoutAwarness: ProviderLocalData,
        private pathMode: SeasonAwarenessPath = SeasonAwarenessPath.UNKNOWN
    ) {
        this.seasonAD = new SeasonAwarenessData(pWithoutAwarness, pWithAwareness)
    }

    public async generateProviderMapping(series: Series, targetSeason?: Season): Promise<Series> {
        const result = await this.getSeasonAwarenessResult(this.seasonAD, targetSeason)
        const convertedResult = this.convertResultToProviderLocalDataWithSeasonInfo(result, this.seasonAD)
        if (this.getHistoryId(this.seasonAD.pWithAwareness) === this.getHistoryId(result.rightProviderWithAwareness)) {
            series.addProviderDatasWithSeasonInfos(...convertedResult)
            return series
        } else {
            const newSeries = new Series()
            newSeries.addProviderDatasWithSeasonInfos(...convertedResult)
            return newSeries
        }
    }

    public async getSeasonAwarenessResult(
        seasonAD: SeasonAwarenessData = this.seasonAD,
        targetSeason?: Season
    ): Promise<SeasonAwarenessResult> {
        if (this.scanHistory.find(x => x == this.getHistoryId(seasonAD.pWithAwareness))) {
            throw new Error('Cant process that two times')
        }
        this.scanHistory.push(this.getHistoryId(seasonAD.pWithAwareness))
        seasonAD.pWithAwareness = await SeasonAwarenessHelper.updateProvider(seasonAD.pWithAwareness)

        if (EpisodeHelper.hasEpisodeNames(seasonAD.pWithAwareness.getAllDetailedEpisodes())) {
            const result = new EpisodeRelationAnalyser(
                seasonAD.pWithoutAwarness.getAllDetailedEpisodes(),
                seasonAD.pWithAwareness.getAllDetailedEpisodes()
            )
            const seasonResult = await this.processEpisodeRelationAnalyserResult(result, targetSeason, seasonAD)
            return seasonResult
        }
        throw new Error('[Season-Provider-Mapper] Can`t start Episode Relation Analyser without Detailed Episodes.')
    }

    /**
     * When no default season is set it will sync season between the given provider local datas.
     * @param pWithAwareness provider with season awareness
     * @param pWithoutAwarness provider without season awareness
     * @param tSeason target season.
     */
    public async getProviderLocalDataWithSeasonTarget(
        tSeason: Season | undefined,
        seasonAD: SeasonAwarenessData = this.seasonAD
    ): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const seasonAwarenessResult = await this.getSeasonAwarenessResult(seasonAD, tSeason)

        return this.convertResultToProviderLocalDataWithSeasonInfo(seasonAwarenessResult, seasonAD)
    }

    private async processEpisodeRelationAnalyserResult(
        result: EpisodeRelationAnalyser,
        targetSeason: Season | undefined,
        seasonAD: SeasonAwarenessData
    ): Promise<SeasonAwarenessResult> {
        if (result.finalSeasonNumbers?.length === 1 && (!targetSeason || this.isSeasonSame(result, targetSeason))) {
            return this.finalizeFinishedEpisodeRelationResult(result, targetSeason, seasonAD)
        } else {
            if (this.canScanPrequel(result, seasonAD, targetSeason)) {
                try {
                    return await this.getRelationEpisodeAnalyse(
                        targetSeason,
                        this.getPrequelProviderLocalDatas(seasonAD.pWithAwareness),
                        seasonAD
                    )
                } catch (err) {
                    logger.debug('[Season-Provider-Mapper] Failed on process prequel')
                }
            }
            if (this.canScanSequel(result, seasonAD, targetSeason)) {
                try {
                    return await this.getRelationEpisodeAnalyse(
                        targetSeason,
                        this.getSequelProviderLocalDatas(seasonAD.pWithAwareness),
                        seasonAD
                    )
                } catch (err) {
                    logger.debug('[Season-Provider-Mapper] Failed on process sequel')
                }
            }
            throw new Error(
                '[Season-Provider-Mapper] Failed process Episode analyse results Sequel and Prequel no trace'
            )
        }
    }

    private async finalizeFinishedEpisodeRelationResult(
        result: EpisodeRelationAnalyser,
        targetSeason: Season | undefined,
        seasonAD: SeasonAwarenessData
    ) {
        let seasonPart = undefined

        if ((result.minEpisodeNumberOfCurrentSeason ?? 0) > 8) {
            try {
                seasonAD.seasonTargetTrackerTrack(SeasonAwarenessPath.PREQUEL)
                seasonPart = await this.getSeasonPartByPrequel(result, targetSeason, seasonAD)
            } catch (err) {
                logger.error(err)
            }
        } else if (result.maxEpisodeNumberOfSeasonHolder != result.maxEpisodes) {
            try {
                seasonAD.seasonTargetTrackerTrack(SeasonAwarenessPath.SEQUEL)
                seasonPart = await this.getSeasonPartBySequel(result, targetSeason, seasonAD)
            } catch (err) {
                logger.error(err)
            }
        } else if (seasonAD.seasonPartTargetTrackerDirection != SeasonAwarenessPath.UNKNOWN) {
            seasonAD.seasonTargetTrackerTrack(seasonAD.seasonPartTargetTrackerDirection)
            throw new Error('End of Season Part Tracking.')
        }
        seasonPart = seasonAD.seasonPartTargetTracker
        return new SeasonAwarenessResult(result, seasonPart, seasonAD.pWithAwareness)
    }

    private async getSeasonPartBySequel(
        result: EpisodeRelationAnalyser,
        targetSeason: Season | undefined,
        seasonAD: SeasonAwarenessData
    ) {
        // check if prequel is the same season (check if it is part 2 or part 1)
        const sequelResult = await this.getRelationEpisodeAnalyse(
            targetSeason,
            this.getSequelProviderLocalDatas(seasonAD.pWithAwareness),
            seasonAD
        )
        if (sequelResult.seasonPart !== undefined && this.isSeasonBetweenERASame(result, sequelResult.epResult)) {
            return sequelResult.seasonPart - 1
        }
    }

    private async getSeasonPartByPrequel(
        result: EpisodeRelationAnalyser,
        targetSeason: Season | undefined,
        seasonAD: SeasonAwarenessData
    ) {
        const prequelResult = await this.getRelationEpisodeAnalyse(
            targetSeason,
            this.getPrequelProviderLocalDatas(seasonAD.pWithAwareness),
            seasonAD
        )
        if (prequelResult.seasonPart !== undefined && this.isSeasonBetweenERASame(result, prequelResult.epResult)) {
            return prequelResult.seasonPart + 1
        }
    }
    private async getRelationEpisodeAnalyse(
        targetSeason: Season | undefined,
        relations: ProviderLocalData[],
        seasonAD: SeasonAwarenessData
    ): Promise<SeasonAwarenessResult> {
        for (const relation of relations) {
            const relationSeasonAD = new SeasonAwarenessData(seasonAD.pWithoutAwarness, relation)
            try {
                relationSeasonAD.loadTrackingData(seasonAD)
                return await this.getSeasonAwarenessResult(relationSeasonAD, targetSeason)
            } catch (err) {
                seasonAD.loadTrackingData(relationSeasonAD)
                logger.debug('[SeasonAwarenessCreatorSeason] Sequel processing error:')
                logger.debug(err)
            }
        }
        throw new Error()
    }
    /**
     * Checks if the Season number of the `EpisodeRelationAnalyser` is the same as the `targetSeason`
     * @param result
     * @param targetSeason
     * @returns
     */
    private isSeasonSame(result: EpisodeRelationAnalyser, targetSeason: Season): boolean {
        const singleSeasonNumber = targetSeason.getSingleSeasonNumberAsNumber()
        if (targetSeason.isSeasonUndefined()) {
            return true
        } else if (SeasonComperator.isSameSeasonNumber(new Season(result.finalSeasonNumbers), targetSeason)) {
            return true
        } else if (singleSeasonNumber && result.maxSeasonNumber && singleSeasonNumber > result.maxSeasonNumber) {
            const tempTargetSeason = new Season(singleSeasonNumber - 1)
            if (
                !this.isFirstEpisode(result.minEpisodeNumberOfSeasonHolder) &&
                SeasonComperator.isSameSeasonNumber(new Season(result.finalSeasonNumbers), tempTargetSeason)
            ) {
                return true
            }
        }
        return false
    }

    private isSeasonBetweenERASame(era1: EpisodeRelationAnalyser, era2: EpisodeRelationAnalyser) {
        return (
            new Season(era1.finalSeasonNumbers).getSingleSeasonNumberAsNumber() ===
            new Season(era2.finalSeasonNumbers).getSingleSeasonNumberAsNumber()
        )
    }

    private isFirstEpisode(minEpisodeNumberOfSeasonHolder: number | undefined): boolean {
        if (minEpisodeNumberOfSeasonHolder === 1) {
            return true
        } else if (minEpisodeNumberOfSeasonHolder === 2) {
            return true
        }
        return false
    }

    private canScanPrequel(
        result: EpisodeRelationAnalyser,
        seasonAD: SeasonAwarenessData,
        targetSeason: Season | undefined
    ) {
        const currentSeason = new Season(result.finalSeasonNumbers).getSingleSeasonNumberAsNumber()
        const targetSeasonNr = targetSeason?.getSingleSeasonNumberAsNumber()

        return (
            result.finalSeasonNumbers?.length === 1 &&
            (this.pathMode === SeasonAwarenessPath.UNKNOWN || this.pathMode === SeasonAwarenessPath.PREQUEL) &&
            !this.isRelationInScanHistory(seasonAD.pWithAwareness.prequelIds, seasonAD.pWithAwareness.provider) &&
            (currentSeason === undefined || targetSeasonNr === undefined || currentSeason > targetSeasonNr)
        )
    }

    private canScanSequel(
        result: EpisodeRelationAnalyser,
        seasonAD: SeasonAwarenessData,
        targetSeason: Season | undefined
    ) {
        const currentSeason = new Season(result.finalSeasonNumbers).getSingleSeasonNumberAsNumber()
        const targetSeasonNr = targetSeason?.getSingleSeasonNumberAsNumber()
        return (
            result.finalSeasonNumbers?.length === 1 &&
            (this.pathMode === SeasonAwarenessPath.UNKNOWN || this.pathMode === SeasonAwarenessPath.SEQUEL) &&
            !this.isRelationInScanHistory(seasonAD.pWithAwareness.sequelIds, seasonAD.pWithAwareness.provider) &&
            (currentSeason === undefined || targetSeasonNr === undefined || currentSeason < targetSeasonNr)
        )
    }

    private isRelationInScanHistory(ids: number[], provider: string): boolean {
        for (const id of ids) {
            const historyId = `${provider}${id}`
            if (this.scanHistory.find(x => x == historyId) !== undefined) {
                return true
            }
        }
        return false
    }

    private getHistoryId(providerLocalData: ProviderLocalData) {
        return `${providerLocalData.provider}${providerLocalData.id}`
    }

    private getPrequelProviderLocalDatas(provider: ProviderLocalData): ProviderLocalData[] {
        const prequels = []
        for (const prequelId of provider.prequelIds) {
            if (provider.instanceName === 'InfoProviderLocalData') {
                prequels.push(
                    new InfoProviderLocalData(
                        prequelId,
                        ProviderList.getProviderInstanceByProviderName(provider.provider) as InfoProvider
                    )
                )
            } else if (provider.instanceName === 'ListProviderLocalData') {
                prequels.push(
                    new ListProviderLocalData(
                        prequelId,
                        ProviderList.getProviderInstanceByProviderName(provider.provider) as ListProvider
                    )
                )
            }
        }
        return prequels
    }

    private getSequelProviderLocalDatas(provider: ProviderLocalData): ProviderLocalData[] {
        const sequels = []
        for (const sequelId of provider.sequelIds) {
            if (provider.instanceName === 'InfoProviderLocalData') {
                sequels.push(
                    new InfoProviderLocalData(
                        sequelId,
                        ProviderList.getProviderInstanceByProviderName(provider.provider) as InfoProvider
                    )
                )
            } else if (provider.instanceName === 'ListProviderLocalData') {
                sequels.push(
                    new ListProviderLocalData(
                        sequelId,
                        ProviderList.getProviderInstanceByProviderName(provider.provider) as ListProvider
                    )
                )
            }
        }
        return sequels
    }

    private convertResultToProviderLocalDataWithSeasonInfo(
        seasonAwarenessResult: SeasonAwarenessResult,
        seasonAD: SeasonAwarenessData
    ) {
        return [
            new ProviderLocalDataWithSeasonInfo(seasonAD.pWithoutAwarness, seasonAwarenessResult.getSeasonTarget()),
            new ProviderLocalDataWithSeasonInfo(
                seasonAwarenessResult.rightProviderWithAwareness,
                seasonAwarenessResult.getSeasonTarget()
            ),
        ]
    }
}
