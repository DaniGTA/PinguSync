import FrontendSeriesListController from './list/frontend-series-list-controller';
import IPCBackgroundController from '../../../communication/ipc-background-controller';
import { chOnce } from '../../../communication/channels';
import MainListSearcher from '../../main-list-manager/main-list-searcher';
import FrontendSeriesInfos from '../../objects/transfer/frontend-series-infos';
import { chListener } from '../../../communication/listener-channels';
import { FailedCover } from './model/failed-cover';
import ProviderLocalData from '../../provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderDataListManager from '../../provider-controller/provider-data-list-manager/provider-data-list-manager';
import isOnline from 'is-online';

export default class FrontendSeriesController {
    private com: IPCBackgroundController;
    public seriesListController: FrontendSeriesListController;


    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.seriesListController = new FrontendSeriesListController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on(chOnce.GetSeriesById, (id) => this.sendSeriesData(chOnce.GetSeriesById, id, this.getSeriesById(id)));
        this.com.on(chOnce.GetPreferedCoverUrlBySeriesId, (id) => this.sendSeriesData(chOnce.GetPreferedCoverUrlBySeriesId, id, this.getCoverUrlById(id)));
        this.com.on(chListener.OnSeriesFailedCoverImage, (failedCover: FailedCover) => this.markCoverAsFailed(failedCover));
        this.com.on(chOnce.GetPreferedNameBySeriesId, async (id) => this.sendSeriesData(chOnce.GetPreferedNameBySeriesId, id, await this.getSeriesPreferedName(id)));
        this.com.on(chOnce.GetSeriesMaxEpisodeNumberBySeriesId, (id) => this.sendSeriesData(chOnce.GetSeriesMaxEpisodeNumberBySeriesId, id, this.getSeriesMaxEpisodeNumberBy(id)));
    }

    private getSeriesById(id: string): FrontendSeriesInfos | null {
        const result = MainListSearcher.findSeriesById(id);
        if (result) {
            return new FrontendSeriesInfos(result);
        }
        return null;
    }

    private getCoverUrlById(id: string): string | undefined {
        const result = MainListSearcher.findSeriesById(id);
        const allCovers = result?.getAllCovers();
        const firstCover = allCovers?.find(x => x.failed === false || x.failed === undefined);
        return firstCover?.url;
    }

    private getSeriesMaxEpisodeNumberBy(id: string): number | undefined {
        const result = MainListSearcher.findSeriesById(id);
        return result?.episodeBindingPools?.length;

    }

    private async getSeriesPreferedName(id: string): Promise<string | undefined> {
        const result = MainListSearcher.findSeriesById(id);
        const names = (await result?.getAllNamesUnique()) ?? [];
        return names[0]?.name;
    }

    private async markCoverAsFailed(failedCover: FailedCover): Promise<void> {
        const result = MainListSearcher.findSeriesById(failedCover.seriesId);
        if (result && await isOnline()) {
            const provider = this.findProviderWithCoverUrl(failedCover.coverUrl, result.getAllProviderLocalDatas());
            if (provider) {
                const index = provider?.covers.findIndex(x => x.url === failedCover.coverUrl) ?? -1;
                if (index !== -1) {
                    provider.covers[index].failed = true;
                    ProviderDataListManager.updateProviderInList(provider);
                }
            }
        }
    }

    private findProviderWithCoverUrl(coverUrl: string, providers: ProviderLocalData[]): ProviderLocalData | undefined {
        for (const provider of providers) {
            if (provider.covers.findIndex(x => x.url === coverUrl) !== -1) {
                return provider;
            }
        }
    }


    private sendSeriesData(channel: string, id: string, data: any): void {
        this.com.send(channel + '-' + id, data);
    }

}