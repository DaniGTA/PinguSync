import ProviderList from '../provider-list';
import InfoProvider from '../../../backend/api/infoProvider';
import ProviderLocalData from '../interfaces/ProviderLocalData';
import Name from './meta/name';
import Cover from './meta/Cover';
import listHelper from '../../helpFunctions/listHelper';
/**
 * Only contains infos about the series.
 */
export class InfoProviderLocalData extends ProviderLocalData {

    public readonly provider: string;
    public names: Name[] = [];
    constructor(lp?: InfoProvider | string) {
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

    public getListProviderInstance(): InfoProvider {
        for (const provider of ProviderList.infoProviderList) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw 'NoProviderFound';
    }

    public static async mergeProviderInfos(...providers: InfoProviderLocalData[]): Promise<InfoProviderLocalData> {
        const mergedProvider = Object.assign(new InfoProviderLocalData(), providers[0]);
        var newestProvider: InfoProviderLocalData | undefined;
        const covers: Cover[] = [];
        for (const provider of providers) {
            if (provider.id != -1) {
                if (mergedProvider.id != -1 && mergedProvider.id != provider.id) {
                    continue;
                }
                if (provider.covers) {
                    covers.push(...provider.covers);
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
            }
        }
        if (newestProvider) {
            if (newestProvider.score) {
                mergedProvider.score = newestProvider.score;
            }
            if (newestProvider.publicScore) {
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
            if (newestProvider.names) {
                mergedProvider.names = newestProvider.names;
            }
            mergedProvider.lastUpdate = newestProvider.lastUpdate;
            mergedProvider.lastExternalChange = newestProvider.lastExternalChange;
        }

        mergedProvider.covers = covers;
        return mergedProvider;
    }
}
