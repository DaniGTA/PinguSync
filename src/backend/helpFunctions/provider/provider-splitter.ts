import Season from '@/backend/controller/objects/meta/season'
import Series from '@/backend/controller/objects/series'
import ProviderLocalData from '@/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import ProviderList from '@/backend/controller/provider-controller/provider-manager/provider-list'
import logger from '@/backend/logger/logger'
import SeasonComperator from '../comperators/season-comperator'
import listHelper from '../list-helper'
import ProviderHelper from './provider-helper'
import ProviderLocalDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info'

export default class ProviderSplitter {
    public static async splitSeriesSeasonIntoSeries(series: Series): Promise<Series[]> {
        const upgradedinfos = await ProviderHelper.requestUpgradeAllCurrentinfos(series)
        series.addProviderDatasWithSeasonInfos(...upgradedinfos)

        const allProviderThatCanBeSplitted = series.getAllProviderLocalDatasWithSeasonInfo().filter(x => {
            try {
                return (
                    !ProviderList.getProviderInstanceByLocalData(x).hasUniqueIdForSeasons &&
                    !x.seasonTarget?.isSeasonNumberPresent()
                )
            } catch (err) {
                return false
            }
        })
        const seriesSeason: Map<Season, ProviderLocalData[]> = this.extractSeaonsFromProviders(
            allProviderThatCanBeSplitted
        )
        if (seriesSeason.size != 0) {
            return this.convertMapToSeries(seriesSeason)
        } else {
            logger.error('Failed to split Season for series: ' + series.id)
            return []
        }
    }

    private static convertMapToSeries(seriesSeason: Map<Season, ProviderLocalData[]>) {
        const newSeries: Series[] = []
        for (const seasonWithProviderLocalDatas of seriesSeason) {
            const newSeason = new Series()
            for (const providerLocalData of seasonWithProviderLocalDatas[1]) {
                newSeason.addProviderDatasWithSeasonInfos(
                    new ProviderLocalDataWithSeasonInfo(providerLocalData, seasonWithProviderLocalDatas[0])
                )
            }
            newSeries.push(newSeason)
        }
        return newSeries
    }

    private static extractSeaonsFromProviders(allProviderThatCanBeSplitted: ProviderLocalDataWithSeasonInfo[]) {
        const seriesSeason: Map<Season, ProviderLocalData[]> = new Map()
        for (const providerTooSplit of allProviderThatCanBeSplitted) {
            let skipSeason: Season | null = null
            for (const episode of providerTooSplit.providerLocalData.getDetailEpisodeInfos()) {
                if (
                    episode.season &&
                    (skipSeason == null || !SeasonComperator.isSameSeason(skipSeason, episode.season))
                ) {
                    if (
                        !listHelper.mapHasKey(
                            seriesSeason,
                            (k, v) =>
                                v.find(x => x.provider === providerTooSplit.providerLocalData.provider) != null &&
                                SeasonComperator.isSameSeason(k, episode.season)
                        )
                    ) {
                        const key = listHelper.mapGetKey(seriesSeason, k =>
                            SeasonComperator.isSameSeason(k, episode.season)
                        )
                        if (!key) {
                            seriesSeason.set(episode.season, [providerTooSplit.providerLocalData])
                        } else {
                            seriesSeason.get(key)?.push(providerTooSplit.providerLocalData)
                        }
                        skipSeason = episode.season
                    }
                }
            }
        }
        return seriesSeason
    }
}
