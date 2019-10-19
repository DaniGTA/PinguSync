import ListProvider from '../../../api/provider/list-provider';
import listHelper from '../../../helpFunctions/list-helper';
import Banner from '../../objects/meta/banner';
import Cover from '../../objects/meta/cover';
import WatchProgress from '../../objects/meta/watch-progress';
import { WatchStatus } from '../../objects/series';
import ProviderList from '../provider-list';
import ProviderLocalData from './interfaces/provider-local-data';
import ProviderNameManager from '../provider-name-manager';

/**
 * Contains info about the series and the user watch progress and the list that series is in.
 */
export class ListProviderLocalData extends ProviderLocalData {

    public static async mergeProviderInfos(...providers: ListProviderLocalData[]): Promise<ListProviderLocalData> {
        const mergedProvider = Object.assign(new ListProviderLocalData(providers[0].id), providers[0]);
        let newestProvider: ListProviderLocalData | undefined;
        const covers: Cover[] = [];
        const banners: Banner[] = [];
        for (const provider of providers) {
            // tslint:disable-next-line: triple-equals
            if (mergedProvider.id != provider.id) {
                continue;
            }
            mergedProvider.addSeriesName(...provider.names);
            mergedProvider.addOverview(...provider.overviews);
            mergedProvider.rawEntry = provider.rawEntry;
            mergedProvider.covers = provider.covers;
            mergedProvider.episodes = provider.episodes;
            if (provider.detailEpisodeInfo && provider.detailEpisodeInfo.length !== 0) {
                mergedProvider.detailEpisodeInfo = provider.detailEpisodeInfo;
            }
            if (provider.covers) {
                for (const cover of provider.covers) {
                    if (!await listHelper.isCoverInList(covers, cover)) {
                        covers.push(cover);
                    }
                }
            }
            if (provider.banners) {
                for (const banner of provider.banners) {
                    if (!await listHelper.isCoverInList(banners, banner)) {
                        banners.push(banner);
                    }
                }
            }
            if (!newestProvider) {
                newestProvider = provider;
            } else if (new Date(newestProvider.lastUpdate).getTime() < new Date(provider.lastUpdate).getTime()) {
                newestProvider = provider;
            }
            if (provider.publicScore) {
                if (mergedProvider.publicScore) {
                    mergedProvider.publicScore = (mergedProvider.publicScore + provider.publicScore) / 2;
                } else {
                    mergedProvider.publicScore = provider.publicScore;
                }
            }
            if (provider.targetSeason) {
                mergedProvider.targetSeason = provider.targetSeason;
            }

            if (typeof provider.score !== 'undefined') {
                if (typeof mergedProvider.score !== 'undefined') {
                    mergedProvider.score = (mergedProvider.score + provider.score) / 2;
                } else {
                    mergedProvider.score = provider.score;
                }
            }

            if (typeof provider.watchProgress !== 'undefined') {
                if (typeof mergedProvider.watchProgress !== 'undefined') {
                    if (mergedProvider.watchProgress < provider.watchProgress) {
                        mergedProvider.watchProgress = provider.watchProgress;
                    }
                } else {
                    mergedProvider.watchProgress = provider.watchProgress;
                }
            }

            if (await ListProviderLocalData.isValidWatchStatus(provider.watchStatus, mergedProvider.watchStatus)) {
                mergedProvider.watchStatus = provider.watchStatus;

            }
        }
        if (newestProvider) {
            if (newestProvider.watchProgress) {
                mergedProvider.watchProgress = newestProvider.watchProgress;
            }
            if (newestProvider.watchStatus) {
                mergedProvider.watchStatus = newestProvider.watchStatus;
            }
            if (newestProvider.score) {
                mergedProvider.score = newestProvider.score;
            }
            if (newestProvider.publicScore) {
                mergedProvider.publicScore = newestProvider.publicScore;
            }
            if (newestProvider.episodes) {
                mergedProvider.episodes = newestProvider.episodes;
            }
            if (newestProvider.sequelIds) {
                mergedProvider.sequelIds = newestProvider.sequelIds;
            }
            if (newestProvider.prequelIds) {
                mergedProvider.prequelIds = newestProvider.prequelIds;
            }
            if (newestProvider.customList) {
                mergedProvider.customList = newestProvider.customList;
            }
            if (newestProvider.customListName) {
                mergedProvider.customListName = newestProvider.customListName;
            }
            if (newestProvider.covers) {
                mergedProvider.covers = newestProvider.covers;
            }
            if (newestProvider.covers) {
                mergedProvider.releaseYear = newestProvider.releaseYear;
            }
            if (newestProvider.covers) {
                mergedProvider.runTime = newestProvider.runTime;
            }
            if (newestProvider.detailEpisodeInfo) {
                mergedProvider.detailEpisodeInfo = newestProvider.detailEpisodeInfo;
            }
            mergedProvider.infoStatus = newestProvider.infoStatus;
            if (newestProvider.targetSeason) {
                mergedProvider.targetSeason = newestProvider.targetSeason;
            }
            mergedProvider.names = await listHelper.getUniqueNameList(mergedProvider.names);
            mergedProvider.overviews = await listHelper.getUniqueOverviewList(mergedProvider.overviews);
            mergedProvider.lastUpdate = newestProvider.lastUpdate;
        }
        mergedProvider.covers = covers;
        mergedProvider.banners = banners;
        return mergedProvider;
    }

    /**
     * Check if [a] can be safly importet in [b]
     * @param a
     * @param b
     */
    private static async isValidWatchStatus(a?: WatchStatus, b?: WatchStatus): Promise<boolean> {
        if (typeof a !== 'undefined') {
            if (typeof a !== 'undefined' && b !== a) {
                if (a === WatchStatus.COMPLETED) {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }
    public readonly provider: string;

    public canUpdateWatchProgress = false;

    public watchStatus?: WatchStatus;
    public watchProgress?: WatchProgress[];

    public customList: boolean = false;
    public customListName = '';
    public version = 1;

    constructor(id: string | number, lp?: ListProvider | string | (new () => ListProvider)) {
        super(id);
        this.lastUpdate = new Date(Date.now());
        if (lp) {
            if (typeof lp === 'string') {
                this.provider = lp;
            } else if (lp instanceof ListProvider) {
                this.provider = lp.providerName;
                this.version = lp.version;
            } else {
                this.provider = ProviderNameManager.getProviderName(lp);
            }
        } else {
            this.provider = '';
        }
    }


    public getProviderInstance(): ListProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw new Error('[ListProviderLocalData] NoProviderFound: '+this.provider);
    }

    public getHighestWatchedEpisode(): WatchProgress | undefined {
        if (typeof this.watchProgress !== 'undefined') {
            try {
                this.watchProgress = [...this.watchProgress];
                const maxEpisode = Math.max(...this.watchProgress.flatMap((x) => x.episode));
                const index = this.watchProgress.findIndex((x) => x.episode === maxEpisode);
                return this.watchProgress[index];
            } catch (err) {
                this.watchProgress = [];
            }
        }
        return;
    }

    public addWatchedEpisodes(episodes: number, plays = 0) {
        for (let index = 1; index < episodes + 1; index++) {
            this.addOneWatchedEpisode(index, plays);

        }
    }

    /**
     * @hasTest
     * @param episode
     * @param date
     * @param plays
     */
    public addOneWatchedEpisode(episode: number, plays = 1, date?: Date): void {
        if (typeof this.watchProgress === 'undefined') {
            this.watchProgress = [];
        }
        const currentWatchProgress = new WatchProgress(episode, plays, date);
        this.watchProgress.push(currentWatchProgress);
    }
    /**
     * @hasTest
     * @param watchProgress
     */
    public addOneWatchProgress(watchProgress: WatchProgress) {
        if (typeof this.watchProgress === 'undefined') {
            this.watchProgress = [];
        }
        this.watchProgress.push(watchProgress);
    }
    /**
     * @hasTest
     * @param watchProgress
     */
    public async removeOneWatchProgress(watchProgress: WatchProgress): Promise<boolean> {
        if (typeof this.watchProgress === 'undefined') {
            this.watchProgress = [];
        }
        const index = this.watchProgress.findIndex((episode) => watchProgress.episode === episode.episode);
        if (index === -1) {
            return false;
        } else {
            this.watchProgress = await listHelper.removeEntrys(this.watchProgress, this.watchProgress[index]);
            return true;
        }
    }
}
