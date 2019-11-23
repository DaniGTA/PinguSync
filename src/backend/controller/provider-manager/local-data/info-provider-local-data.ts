import InfoProvider from '../../../api/provider/info-provider';
import listHelper from '../../../helpFunctions/list-helper';
import Banner from '../../objects/meta/banner';
import Cover from '../../objects/meta/cover';
import ProviderList from '../provider-list';
import ProviderLocalData from './interfaces/provider-local-data';
import ProviderNameManager from '../provider-name-manager';
/**
 * Only contains infos about the series.
 */
export class InfoProviderLocalData extends ProviderLocalData {
    public static async mergeProviderInfos(...providers: InfoProviderLocalData[]): Promise<InfoProviderLocalData> {
        const mergedProvider = Object.assign(new InfoProviderLocalData(providers[0].id), providers[0]);
        let newestProvider: InfoProviderLocalData | undefined;
        const covers: Cover[] = [];
        const banners: Banner[] = [];

        for (const provider of providers) {
            // tslint:disable-next-line: triple-equals
            if (mergedProvider.id != provider.id) {
                continue;
            }
            mergedProvider.addSeriesName(...provider.names);
            mergedProvider.addOverview(...provider.overviews);
            if (provider.covers) {
                for (const cover of provider.covers) {
                    if (!await listHelper.isCoverInList(covers, cover)) {
                        covers.push(...provider.covers);
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

            if (provider.episodes) {
                mergedProvider.episodes = provider.episodes;
            }

            if (provider.detailEpisodeInfo && provider.detailEpisodeInfo.length !== 0) {
                mergedProvider.detailEpisodeInfo = provider.detailEpisodeInfo;
            }
            mergedProvider.rawEntry = provider.rawEntry;
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

            if (provider.score) {
                if (mergedProvider.score) {
                    mergedProvider.score = (mergedProvider.score + provider.score) / 2;
                } else {
                    mergedProvider.score = provider.score;
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
            if (newestProvider.sequelIds) {
                mergedProvider.sequelIds = newestProvider.sequelIds;
            }
            if (newestProvider.prequelIds) {
                mergedProvider.prequelIds = newestProvider.prequelIds;
            }
            if (newestProvider.covers) {
                mergedProvider.releaseYear = newestProvider.releaseYear;
            }
            if (newestProvider.covers) {
                mergedProvider.runTime = newestProvider.runTime;
            }
            if (newestProvider.detailEpisodeInfo && newestProvider.detailEpisodeInfo.length !== 0) {
                mergedProvider.detailEpisodeInfo = newestProvider.detailEpisodeInfo;
            }
            mergedProvider.names = await listHelper.getUniqueNameList(mergedProvider.names);
            mergedProvider.overviews = await listHelper.getUniqueOverviewList(mergedProvider.overviews);
            mergedProvider.infoStatus = newestProvider.infoStatus;
            mergedProvider.lastUpdate = newestProvider.lastUpdate;
            mergedProvider.lastExternalChange = newestProvider.lastExternalChange;
        }

        mergedProvider.covers = covers;
        mergedProvider.banners = banners;
        return mergedProvider;
    }
    public readonly provider: string;
    public version = 1;
    constructor(id: string | number, lp?: InfoProvider | string | (new () => InfoProvider)) {
        super(id);
        this.lastUpdate = new Date(Date.now());
        if (lp) {
            if (typeof lp === 'string') {
                this.provider = lp;
            } else if (lp instanceof InfoProvider) {
                this.provider = lp.providerName;
                this.version = lp.version;
            } else {
                this.provider = ProviderNameManager.getProviderName(lp);
            }
        } else {
            this.provider = '';
        }
    }

    public getProviderInstance(): InfoProvider {
        for (const provider of ProviderList.getInfoProviderList()) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw new Error('[InfoProviderLocalData] NoProviderFound: ' + this.provider);
    }
}
