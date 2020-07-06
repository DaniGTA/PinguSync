import IPCBackgroundController from '../../../communication/ipc-background-controller';
import { chOnce } from '../../../communication/channels';
import MainListSearcher from '../../main-list-manager/main-list-searcher';
import Episode from '../../objects/meta/episode/episode';
import SingleEpisodeQuery from '../../frontend/episodes/model/singel-episode-query';

export default class FrontendEpisodesController {
    private com: IPCBackgroundController;


    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on(chOnce.GetEpisodeIdsListBySeriesId, async (id) => this.sendSeriesData(chOnce.GetEpisodeIdsListBySeriesId, id, await this.getEpisodeIdsList(id)));
        this.com.on(chOnce.GetEpisodeByEpisodeId, async (query: SingleEpisodeQuery) => this.sendSeriesData(chOnce.GetEpisodeByEpisodeId, query.episodeId, await this.getSingleEpisode(query)));
    }

    private async getEpisodeIdsList(id: string): Promise<string[][]> {
        const series = await MainListSearcher.findSeriesById(id);
        const episodesIds: string[][] = [];
        if (series) {
            for (const episode of series.episodeBindingPools) {
                episodesIds.push(episode.bindedEpisodeMappings.map(x => x.id));
            }
        }
        
        return episodesIds;
    }

    private async getSingleEpisode(query: SingleEpisodeQuery): Promise<Episode | undefined> {
        const series = await MainListSearcher.findSeriesById(query.seriesId);
        for (const localData of series?.getAllProviderLocalDatas() ?? []) {
            for (const episode of localData.getAllDetailedEpisodes()) {
                if (query.episodeId == episode.id) {
                    return episode;
                }
            } 
        }
    }



    private sendSeriesData(channel: string, id: string, data: any): void {
        this.com.send(channel + '-' + id, data);
    }

}