import ListProvider from '../../api/ListProvider';
import { WatchStatus } from './anime';
import ProviderController from '../providerController';

export class ProviderInfo {
    public id: number | string = -1;
    public readonly provider: string;
    public score?: number;
    public publicScore?: number;
    public watchStatus: WatchStatus | undefined;
    public watchProgress: number | undefined;
    public rawEntry: any;
    public lastUpdate: Date;
    constructor(lp?: ListProvider) {
        this.lastUpdate = new Date(Date.now());
        if (typeof lp != 'undefined') {
            this.provider = lp.providerName;
        } else {
            this.provider = '';
        }
    }


    public getProviderInstance(): ListProvider {
        for (const provider of ProviderController.getInstance().list) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw 'NoProviderFound';
    }

    static mergeProviderInfos(...providers: ProviderInfo[]): ProviderInfo {
        const mergedProvider = new ProviderInfo(providers[0].getProviderInstance());
        var newestProvider: ProviderInfo = providers[0];
        for (const provider of providers) {
            if (provider.id != -1) {
                if (mergedProvider.id != -1 && mergedProvider.id != provider.id) {
                    continue;
                }
                mergedProvider.id = provider.id;
                mergedProvider.rawEntry = provider.rawEntry;
                if (provider.lastUpdate.getMilliseconds() < newestProvider.lastUpdate.getMilliseconds()) {
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

                if (typeof provider.watchStatus != 'undefined') {
                    if (typeof mergedProvider.watchStatus != 'undefined' && mergedProvider.watchStatus != provider.watchStatus) {
                        if (provider.watchStatus == WatchStatus.COMPLETED) {
                            mergedProvider.watchStatus = provider.watchStatus;
                        }
                    } else {
                        mergedProvider.score = provider.score;
                    }
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

        return mergedProvider;
    }
}
