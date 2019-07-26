import ListProvider from '../../api/ListProvider';
import { WatchStatus } from './anime';
import ProviderList from '../providerList';
import { WatchProgress } from './watchProgress';
import listHelper from '../../helpFunctions/listHelper';
import ProviderLocalData from '../interfaces/ProviderLocalData';

/**
 * Contains info about the series and the user watch progress and the list that series is in.
 */
export class ListProviderLocalData extends ProviderLocalData {
    public readonly provider: string;

    public canUpdateWatchProgress = false;

    public watchStatus?: WatchStatus;
    public watchProgress?: WatchProgress[];

    public customList: boolean = false;
    public customListName = '';

    constructor(lp?: ListProvider | string) {
        super();
        this.lastUpdate = new Date(Date.now());
        if (typeof lp === 'string') {
            this.provider = lp;
        } else if (typeof lp != 'undefined') {
            this.provider = lp.providerName;
        } else {
            this.provider = '';
        }
    }


    public getListProviderInstance(): ListProvider {
        for (const provider of ProviderList.listProviderList) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw 'NoProviderFound';
    }

    public getHighestWatchedEpisode(): WatchProgress | undefined {
        if (typeof this.watchProgress != 'undefined') {
            try {
                this.watchProgress = [...this.watchProgress];
                const maxEpisode = Math.max(...this.watchProgress.flatMap(x => x.episode));
                const index = this.watchProgress.findIndex(x => x.episode === maxEpisode);
                return this.watchProgress[index];
            } catch (err) {
                this.watchProgress = [];
            }
        }
        return;
    }
    /**
     * @hasTest
     * @param episode 
     * @param date 
     * @param plays 
     */
    public addOneEpisode(episode: number, plays = 1, date?: Date): void {
        if (typeof this.watchProgress === 'undefined') {
            this.watchProgress = []
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
            this.watchProgress = []
        }
        this.watchProgress.push(watchProgress);
    }
    /**
     * @hasTest
     * @param watchProgress 
     */
    public async removeOneWatchProgress(watchProgress: WatchProgress): Promise<boolean> {
        if (typeof this.watchProgress === 'undefined') {
            this.watchProgress = []
        }
        const index = this.watchProgress.findIndex(episode => watchProgress.episode === episode.episode);
        if (index == -1) {
            return false;
        } else {
            this.watchProgress = await listHelper.removeEntrys(this.watchProgress, this.watchProgress[index]);
            return true;
        }
    }

    public static async mergeProviderInfos(...providers: ListProviderLocalData[]): Promise<ListProviderLocalData> {
        const mergedProvider = Object.assign(new ListProviderLocalData(), providers[0]);
        var newestProvider;
        for (const provider of providers) {
            if (provider.id != -1) {
                if (mergedProvider.id != -1 && mergedProvider.id != provider.id) {
                    continue;
                }
                mergedProvider.id = provider.id;
                mergedProvider.rawEntry = provider.rawEntry;
                if (!newestProvider) {
                    newestProvider = provider;
                } else if (new Date(newestProvider.lastUpdate).getTime() < new Date(provider.lastUpdate).getTime()) {
                    newestProvider = provider;
                }
                if (typeof provider.publicScore != 'undefined') {
                    if (typeof mergedProvider.publicScore != 'undefined') {
                        mergedProvider.publicScore = (mergedProvider.publicScore + provider.publicScore) / 2;
                    } else {
                        mergedProvider.publicScore = provider.publicScore;
                    }
                }

                if (typeof provider.score != 'undefined') {
                    if (typeof mergedProvider.score != 'undefined') {
                        mergedProvider.score = (mergedProvider.score + provider.score) / 2;
                    } else {
                        mergedProvider.score = provider.score;
                    }
                }

                if (typeof provider.watchProgress != 'undefined') {
                    if (typeof mergedProvider.watchProgress != 'undefined') {
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
            if (newestProvider.score) {
                mergedProvider.publicScore = newestProvider.publicScore;
            }
            if (newestProvider.episodes) {
                mergedProvider.episodes = newestProvider.episodes;
            }
            if (newestProvider.sequelId) {
                mergedProvider.sequelId = newestProvider.sequelId;
            }
            if (newestProvider.prequelId) {
                mergedProvider.prequelId = newestProvider.prequelId;
            }
            if (newestProvider.customList) {
                mergedProvider.customList = newestProvider.customList;
            }
            if (newestProvider.customListName) {
                mergedProvider.customListName = newestProvider.customListName;
            }
        }

        return mergedProvider;
    }

    /**
     * Check if [a] can be safly importet in [b]
     * @param a 
     * @param b 
     */
    private static async isValidWatchStatus(a?: WatchStatus, b?: WatchStatus): Promise<boolean> {
        if (typeof a != 'undefined') {
            if (typeof a != 'undefined' && b != a) {
                if (a == WatchStatus.COMPLETED) {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }
}
