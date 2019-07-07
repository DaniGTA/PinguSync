import ListProvider from '../../api/ListProvider';
import { WatchStatus } from './anime';
import ProviderController from '../providerController';
import ProviderList from '../providerList';

export class ProviderInfo {
    public id: number | string = -1;
    public readonly provider: string;

    public rawEntry: any;
    public lastUpdate: Date;
    public canUpdateWatchProgress = false;
    public lastExternalChange: Date = new Date(0);

    public watchStatus?: WatchStatus;
    public watchProgress?: number;
    public score?: number;
    public episodes?: number;
    public publicScore?: number;

    public sequelId?: number;
    public prequelId?: number;

    constructor(lp?: ListProvider) {
        this.lastUpdate = new Date(Date.now());
        if (typeof lp != 'undefined') {
            this.provider = lp.providerName;
        } else {
            this.provider = '';
        }
    }


    public getProviderInstance(): ListProvider {
        for (const provider of ProviderList.list) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw 'NoProviderFound';
    }

    static async mergeProviderInfos(...providers: ProviderInfo[]): Promise<ProviderInfo> {
        const mergedProvider = Object.assign(new ProviderInfo(), providers[0]);
        var newestProvider: ProviderInfo = Object.assign(new ProviderInfo(), providers[0]);
        for (const provider of providers) {
            if (provider.id != -1) {
                if (mergedProvider.id != -1 && mergedProvider.id != provider.id) {
                    continue;
                }
                mergedProvider.id = provider.id;
                mergedProvider.rawEntry = provider.rawEntry;
                if (new Date(provider.lastUpdate).getMilliseconds() > new Date(newestProvider.lastUpdate).getMilliseconds()) {
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

                if (await ProviderInfo.isValidWatchStatus(provider.watchStatus, mergedProvider.watchStatus)) {
                    mergedProvider.watchStatus = provider.watchStatus;

                }
            }
        }
        if (typeof newestProvider.watchProgress != 'undefined') {
            mergedProvider.watchProgress = newestProvider.watchProgress;
        }
        if (typeof newestProvider.watchStatus != 'undefined') {
            mergedProvider.watchStatus = newestProvider.watchStatus;
        }
        if (typeof newestProvider.score != 'undefined') {
            mergedProvider.score = newestProvider.score;
        }
        if (typeof newestProvider.score != 'undefined') {
            mergedProvider.publicScore = newestProvider.publicScore;
        }
        if (typeof newestProvider.episodes != 'undefined') {
            mergedProvider.episodes = newestProvider.episodes;
        }
        if (typeof newestProvider.sequelId != 'undefined') {
            mergedProvider.sequelId = newestProvider.sequelId;
        }
        if (typeof newestProvider.prequelId != 'undefined') {
            mergedProvider.prequelId = newestProvider.prequelId;
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
