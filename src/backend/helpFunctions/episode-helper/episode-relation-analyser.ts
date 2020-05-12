import Episode from '../../controller/objects/meta/episode/episode';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';
import EpisodeComperator from '../comperators/episode-comperator';
import SeasonComperator from '../comperators/season-comperator';
import listHelper from '../list-helper';
import EpisodeHelper from './episode-helper';

export default class EpisodeRelationAnalyser {
    private static readonly toleranze = 1;

    public numberOfRegularEpisodesFound = 0;
    public numberOfSpecialEpisodesFound = 0;
    public maxEpisodeNumberOfCurrentSeason = 0;
    public minEpisodeNumberOfCurrentSeason: number | undefined;
    public minEpisodeNumberOfSeasonHolder: number | undefined;
    public maxEpisodeNumberOfSeasonHolder = 0;
    public maxDifference = 0;
    public seasonNumbers: number[] = [];
    public maxEpisodes = 0;
    public finalSeasonNumbers: number[] = [];
    public missingEpisodes: number;
    public seasonComplete = false;
    public maxSeasonNumber: number | undefined;

    constructor(private seasonHolder: Episode[], private currentSeason: Episode[]) {
        this.calcAllInformations();
        this.updateMaxEpisodes();
        this.missingEpisodes = this.maxEpisodes - this.numberOfRegularEpisodesFound;
        this.updateSeasonComplete();
    }

    private updateSeasonComplete() {
        if (this.maxEpisodes !== 0) {
            this.seasonComplete = (this.maxEpisodes === this.maxDifference + this.maxEpisodeNumberOfCurrentSeason) ||
                this.missingEpisodes === EpisodeRelationAnalyser.toleranze;
        }
    }

    private updateMaxEpisodes() {
        for (const season of this.finalSeasonNumbers) {
            this.maxEpisodes += this.getRegularEpisodeCountOfSeason(this.seasonHolder, new Season([season]));
        }
    }

    private calcAllInformations() {
        for (const episode of this.seasonHolder) {
            for (const newEpisodes of this.currentSeason) {
                const result = EpisodeComperator.compareEpisodeTitle(episode, newEpisodes);
                if (result.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                    this.updateAllInformations(episode, newEpisodes);
                }
            }
        }
        this.updateMaxSeasonNumber(this.seasonHolder);

    }

    private updateAllInformations(seasonHolder: Episode, currentSeason: Episode) {
        this.updateSeasonHolderInformations(seasonHolder);
        this.updateCurrentSeasonInformations(currentSeason);
        this.updateMaxDifference(seasonHolder, currentSeason);
        this.updateEpisodeCounter(currentSeason);
        this.updateSeasonNumbers(seasonHolder);
    }

    private updateSeasonHolderInformations(episode: Episode) {
        const newEpisodeNumber = episode.episodeNumber as unknown as number;
        if (!isNaN(newEpisodeNumber as unknown as number)) {
            this.updateMinEpisodeNumberOfSeasonHolder(newEpisodeNumber);
            this.updateMaxEpisodeNumberOfSeasonHolder(newEpisodeNumber);
        }
    }

    private updateCurrentSeasonInformations(episode: Episode) {
        const newEpisodeNumber = episode.episodeNumber as unknown as number;
        if (!isNaN(newEpisodeNumber as unknown as number)) {
            this.updateMinEpisodeNumberOfCurrentSeason(newEpisodeNumber);
            this.updateMaxEpisodeNumberOfCurrentSeason(newEpisodeNumber);
        }
    }

    private updateMinEpisodeNumberOfSeasonHolder(episodeNumber: number) {
        if (this.minEpisodeNumberOfSeasonHolder === undefined || episodeNumber < this.minEpisodeNumberOfSeasonHolder) {
            this.minEpisodeNumberOfSeasonHolder = episodeNumber;
        }
    }

    private updateMinEpisodeNumberOfCurrentSeason(episodeNumber: number) {
        if (this.minEpisodeNumberOfCurrentSeason === undefined || episodeNumber < this.minEpisodeNumberOfCurrentSeason) {
            this.minEpisodeNumberOfCurrentSeason = episodeNumber;
        }
    }

    private updateMaxEpisodeNumberOfSeasonHolder(episodeNumber: number) {
        if (episodeNumber > this.maxEpisodeNumberOfSeasonHolder) {
            this.maxEpisodeNumberOfSeasonHolder = episodeNumber;
        }
    }

    private updateMaxEpisodeNumberOfCurrentSeason(episodeNumber: number) {
        if (episodeNumber > this.maxEpisodeNumberOfCurrentSeason) {
            this.maxEpisodeNumberOfCurrentSeason = episodeNumber;
        }
    }
    private updateSeasonNumbers(episode: Episode) {
        this.updateFinalSeasonNumber(episode);
    }

    private updateFinalSeasonNumber(episode: Episode) {
        if (episode.season !== undefined && episode.season.seasonNumbers !== undefined) {
            for (const seasonNumber of episode.season.seasonNumbers) {
                if (!isNaN(seasonNumber as number)) {
                    this.seasonNumbers.push(Number.parseInt(seasonNumber as string, 10));
                }
            }
        }
        this.finalSeasonNumbers = listHelper.getUniqueList(this.seasonNumbers);
    }

    private updateMaxSeasonNumber(episodes: Episode[]) {
        let maxSeasonNumber = -1;
        for (const episode of episodes) {
            if (episode.season !== undefined && episode.season.seasonNumbers !== undefined) {
                for (const seasonNumber of episode.season.seasonNumbers) {
                    if (!isNaN(seasonNumber as number) && maxSeasonNumber < seasonNumber) {
                        maxSeasonNumber = seasonNumber as number;
                    }
                }
            }
        }
        if (maxSeasonNumber !== -1) {
            this.maxSeasonNumber = maxSeasonNumber;
        }
    }

    private updateEpisodeCounter(episode: Episode) {
        if (episode.type === EpisodeType.UNKOWN || episode.type === EpisodeType.REGULAR_EPISODE) {
            this.numberOfRegularEpisodesFound++;
        } else {
            this.numberOfSpecialEpisodesFound++;
        }
    }

    private updateMaxDifference(episodeA: Episode, episodeB: Episode) {
        let diff: number | null = null;

        diff = Math.abs(EpisodeHelper.getEpisodeDifference(episodeA, episodeB));

        if (diff !== null && diff > this.maxDifference) {
            this.maxDifference = diff;
        }
    }


    private getRegularEpisodeCountOfSeason(episodes: Episode[], seasonNumber: Season): number {
        let episodeCounter = 0;
        for (const episode of episodes) {
            if (episode.type === EpisodeType.UNKOWN || episode.type === EpisodeType.REGULAR_EPISODE) {
                if (SeasonComperator.isSameSeason(episode.season, seasonNumber)) {
                    episodeCounter++;
                }
            }
        }
        return episodeCounter;
    }
}
