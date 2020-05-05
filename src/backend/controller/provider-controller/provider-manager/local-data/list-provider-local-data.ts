import ListProvider from '../../../../api/provider/list-provider';
import listHelper from '../../../../helpFunctions/list-helper';
import WatchProgress from '../../../objects/meta/watch-progress';
import { WatchStatus } from '../../../objects/series';
import ProviderList from '../provider-list';
import ProviderNameManager from '../provider-name-manager';
import ProviderLocalData from './interfaces/provider-local-data';

/**
 * Contains info about the series and the user watch progress and the list that series is in.
 */
export class ListProviderLocalData extends ProviderLocalData {

    public static async mergeProviderInfos(...providers: ListProviderLocalData[]): Promise<ListProviderLocalData> {
        const finalProvider = await this.mergeProviderLocalData(...providers) as ListProviderLocalData;
        finalProvider.watchProgress = finalProvider.watchProgress ? await listHelper.getUniqueObjectList(finalProvider.watchProgress) : [];
        return Object.assign(new ListProviderLocalData(finalProvider.id), finalProvider);
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
    public watchProgress: WatchProgress[] = [];

    public customList = false;
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
        throw new Error('[ListProviderLocalData] NoProviderFound: ' + this.provider);
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

    public addWatchedEpisodes(episodes: number, plays = 0): void {
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
    public addOneWatchProgress(watchProgress: WatchProgress): void {
        if (typeof this.watchProgress === 'undefined') {
            this.watchProgress = [];
        }
        this.watchProgress.push(watchProgress);
    }
    /**
     * @hasTest
     * @param watchProgress
     */
    public removeOneWatchProgress(watchProgress: WatchProgress): boolean {
        if (typeof this.watchProgress === 'undefined') {
            this.watchProgress = [];
        }
        const index = this.watchProgress.findIndex((episode) => watchProgress.episode === episode.episode);
        if (index === -1) {
            return false;
        } else {
            this.watchProgress = listHelper.removeEntrys(this.watchProgress, this.watchProgress[index]);
            return true;
        }
    }
}
