import { InformationTrustRank } from '../../api/provider/information-trust-rank'
import Episode from '../../controller/objects/meta/episode/episode'
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type'
import Season from '../../controller/objects/meta/season'
import ProviderDataListManager from '../../controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import ProviderList from '../../controller/provider-controller/provider-manager/provider-list'
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result'
import EpisodeComperator from '../comperators/episode-comperator'
import SeasonComperator from '../comperators/season-comperator'
import listHelper from '../list-helper'
import EpisodeHelper from './episode-helper'

export default class EpisodeRelationAnalyser {
    private static readonly toleranze = 1

    public numberOfRegularEpisodesFound = 0
    public numberOfSpecialEpisodesFound = 0
    public maxEpisodeNumberOfCurrentSeason = 0
    public minEpisodeNumberOfCurrentSeason: number | undefined
    public minEpisodeNumberOfSeasonHolder: number | undefined
    public maxEpisodeNumberOfSeasonHolder = 0
    public maxDifference = 0
    public seasonNumbers: number[] = []
    public maxEpisodes = 0
    public finalSeasonNumbers: number[] = []
    public missingEpisodes: number
    public seasonComplete = false
    public maxSeasonNumber: number | undefined
    public curruptData = false

    constructor(private seasonHolder: Episode[], private currentSeason: Episode[]) {
        this.calcAllInformations()
        this.updateMaxEpisodes()
        this.missingEpisodes = this.maxEpisodes - this.numberOfRegularEpisodesFound
        this.updateSeasonComplete()
    }

    private updateSeasonComplete(): void {
        if (this.maxEpisodes !== 0) {
            this.seasonComplete =
                this.maxEpisodes <= this.maxDifference + this.maxEpisodeNumberOfCurrentSeason ||
                this.missingEpisodes === EpisodeRelationAnalyser.toleranze
            if (this.seasonComplete === false) {
                if (
                    this.isOneSeasonNumber() &&
                    this.finalSeasonNumbers[0] !== undefined &&
                    this.maxEpisodes ===
                        this.getRegularEpisodeCountOfSeason(
                            this.currentSeason,
                            new Season([this.finalSeasonNumbers[0]])
                        )
                ) {
                    if (this.maxEpisodes / 2 < this.numberOfRegularEpisodesFound) {
                        this.seasonComplete = true
                    }
                }
            }
        }
    }

    private updateMaxEpisodes(): void {
        for (const season of this.finalSeasonNumbers) {
            this.maxEpisodes += this.getRegularEpisodeCountOfSeason(this.seasonHolder, new Season([season]))
        }
    }

    private calcAllInformations(): void {
        const canSeasonHolderBeCurrupt = this.canBeCorrupted(this.seasonHolder[0])
        for (const episode of this.seasonHolder) {
            let founds = 0
            for (const newEpisodes of this.currentSeason) {
                const result = EpisodeComperator.isSameEpisodeTitle(episode, newEpisodes)
                if (result.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                    this.updateAllInformations(episode, newEpisodes)
                    if (!canSeasonHolderBeCurrupt) {
                        break
                    } else {
                        founds++
                    }
                }
            }
            if (founds > 1) {
                const providerInstance = ProviderList.getProviderInstanceByProviderName(episode.provider ?? '')
                if (providerInstance && episode.providerId !== undefined) {
                    ProviderDataListManager.markProviderDataAsCorrupt(providerInstance, episode.providerId)
                }
                this.curruptData = true
                break
            }
        }
        this.updateMaxSeasonNumber(this.seasonHolder)
    }

    private updateAllInformations(seasonHolder: Episode, currentSeason: Episode): void {
        this.updateSeasonHolderInformations(seasonHolder)
        this.updateCurrentSeasonInformations(currentSeason)
        this.updateMaxDifference(seasonHolder, currentSeason)
        this.updateEpisodeCounter(currentSeason)
        this.updateSeasonNumbers(seasonHolder)
    }

    private updateSeasonHolderInformations(episode: Episode): void {
        const newEpisodeNumber = (episode.episodeNumber as unknown) as number
        if (!isNaN((newEpisodeNumber as unknown) as number)) {
            this.updateMinEpisodeNumberOfSeasonHolder(newEpisodeNumber)
            this.updateMaxEpisodeNumberOfSeasonHolder(newEpisodeNumber)
        }
    }

    private updateCurrentSeasonInformations(episode: Episode): void {
        const newEpisodeNumber = (episode.episodeNumber as unknown) as number
        if (!isNaN((newEpisodeNumber as unknown) as number)) {
            this.updateMinEpisodeNumberOfCurrentSeason(newEpisodeNumber)
            this.updateMaxEpisodeNumberOfCurrentSeason(newEpisodeNumber)
        }
    }

    private updateMinEpisodeNumberOfSeasonHolder(episodeNumber: number): void {
        if (this.minEpisodeNumberOfSeasonHolder === undefined || episodeNumber < this.minEpisodeNumberOfSeasonHolder) {
            this.minEpisodeNumberOfSeasonHolder = episodeNumber
        }
    }

    private updateMinEpisodeNumberOfCurrentSeason(episodeNumber: number): void {
        if (
            this.minEpisodeNumberOfCurrentSeason === undefined ||
            episodeNumber < this.minEpisodeNumberOfCurrentSeason
        ) {
            this.minEpisodeNumberOfCurrentSeason = episodeNumber
        }
    }

    private updateMaxEpisodeNumberOfSeasonHolder(episodeNumber: number): void {
        if (episodeNumber > this.maxEpisodeNumberOfSeasonHolder) {
            this.maxEpisodeNumberOfSeasonHolder = episodeNumber
        }
    }

    private updateMaxEpisodeNumberOfCurrentSeason(episodeNumber: number): void {
        if (episodeNumber > this.maxEpisodeNumberOfCurrentSeason) {
            this.maxEpisodeNumberOfCurrentSeason = episodeNumber
        }
    }
    private updateSeasonNumbers(episode: Episode): void {
        this.updateFinalSeasonNumber(episode)
    }

    private updateFinalSeasonNumber(episode: Episode): void {
        if (episode.season !== undefined && episode.season.seasonNumbers !== undefined) {
            for (const seasonNumber of episode.season.seasonNumbers) {
                if (!isNaN(seasonNumber as number)) {
                    this.seasonNumbers.push(Number.parseInt(seasonNumber as string, 10))
                }
            }
        }
        this.finalSeasonNumbers = listHelper.getUniqueList(this.seasonNumbers)
    }

    private updateMaxSeasonNumber(episodes: Episode[]): void {
        let maxSeasonNumber = -1
        for (const episode of episodes) {
            if (episode.season !== undefined && episode.season.seasonNumbers !== undefined) {
                for (const seasonNumber of episode.season.seasonNumbers) {
                    if (!isNaN(seasonNumber as number) && maxSeasonNumber < seasonNumber) {
                        maxSeasonNumber = seasonNumber as number
                    }
                }
            }
        }
        if (maxSeasonNumber !== -1) {
            this.maxSeasonNumber = maxSeasonNumber
        }
    }

    private updateEpisodeCounter(episode: Episode): void {
        if (episode.type === EpisodeType.UNKOWN || episode.type === EpisodeType.REGULAR_EPISODE) {
            this.numberOfRegularEpisodesFound++
        } else {
            this.numberOfSpecialEpisodesFound++
        }
    }

    private updateMaxDifference(episodeA: Episode, episodeB: Episode): void {
        let diff: number | null = null

        diff = Math.abs(EpisodeHelper.getEpisodeDifference(episodeA, episodeB))

        if (diff !== null && diff > this.maxDifference) {
            this.maxDifference = diff
        }
    }

    private getRegularEpisodeCountOfSeason(episodes: Episode[], seasonNumber: Season): number {
        let episodeCounter = 0
        for (const episode of episodes) {
            if (episode.type === EpisodeType.UNKOWN || episode.type === EpisodeType.REGULAR_EPISODE) {
                if (SeasonComperator.isSameSeason(episode.season, seasonNumber)) {
                    episodeCounter++
                }
            }
        }
        return episodeCounter
    }

    private isOneSeasonNumber() {
        let lastSeasonNumber: undefined | number
        for (const seasonNumber of this.seasonNumbers) {
            if (lastSeasonNumber === undefined) {
                lastSeasonNumber = seasonNumber
            } else if (lastSeasonNumber !== seasonNumber) {
                return false
            }
        }
        return true
    }

    private canBeCorrupted(ep: Episode): boolean {
        try {
            return (
                ProviderList.getProviderInstanceByProviderName(ep?.provider ?? '')?.canTrustInformations ==
                InformationTrustRank.CURRUPT_DATA
            )
        } catch (err) {
            return false
        }
    }
}
