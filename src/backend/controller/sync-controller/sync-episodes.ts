import Series from '../objects/series';
import ListProvider from '../../api/provider/list-provider';
import Episode from '../objects/meta/episode/episode';
import EpisodeMapping from '../objects/meta/episode/episode-mapping';

export default class SyncEpisodes {
    constructor(private series: Series) {

    }

    syncAllEpisodesBetweenProviders(providers: ListProvider[]) {
        for (const epPool of this.series.episodeBindingPools) {
            const epBinding = epPool.bindedEpisodeMappings.find(x => x.provider === 'provider.providerName');
            const episode = this.getEpisodeByBinding(epBinding);
            if (episode) {
                const result = this.isSyncByEpisode(episode);
                if (!result) {
                    return false;
                }
            }
        }
        return true;
    }

    isSync(provider: ListProvider): boolean {
        for (const epPool of this.series.episodeBindingPools) {
            const epBinding = epPool.bindedEpisodeMappings.find(x => x.provider === provider.providerName);
            const episode = this.getEpisodeByBinding(epBinding);
            if (episode) {
                const result = this.isSyncByEpisode(episode);
                if (!result) {
                    return false;
                }
            }
        }
        return true;
    }

    isSyncById(id: string, provider?: string): boolean {
        const ep = this.getEpisodeById(id, provider);
        return this.isSyncByEpisode(ep);
    }

    isSyncByEpisode(episode: Episode): boolean {
        let isEpsiodeWatchedByAnyProvider = false;
        for (const episodePool of this.series.episodeBindingPools) {
            const ep = episodePool.bindedEpisodeMappings.find(x => x.id == episode.id);
            if (ep) {
                isEpsiodeWatchedByAnyProvider = this.isEpisodeWatchedByEpisode(episode);
                if (!isEpsiodeWatchedByAnyProvider) {
                    for (const otherEp of episodePool.bindedEpisodeMappings.filter(x => x.id != episode.id)) {
                        const isWatched = this.isEpisodeWatchedById(otherEp.id);
                        if (isWatched) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
        throw 'Episode not found';
    }

    isEpisodeWatchedById(id: string): boolean {
        const episode = this.getEpisodeById(id);
        return this.isEpisodeWatchedByEpisode(episode);
    }

    isEpisodeWatchedByEpisode(episode: Episode): boolean {
        return episode.watchHistory.length !== 0;
    }


    getEpisodeByEpisodeMapping(em: EpisodeMapping): Episode | undefined {
        const provider = this.series.getAllProviderLocalDatas().find(x => x.provider === em.provider);
        return provider?.detailEpisodeInfo.find(x => x.id === em.id);
    }

    getEpisodeById(id: string, providerName?: string): Episode {
        let result;
        if (providerName) {
            result = this.getEpisodeByIdAndProvider(id, providerName);
        } else {
            for (const provider of this.series.getAllProviderLocalDatas()) {
                result = provider?.detailEpisodeInfo.find(x => x.id === id);
            }
        }
        if (result) {
            return result;
        }
        throw new Error('Episode not found with id: ' + id);
    }

    private getEpisodeByBinding(epBinding?: EpisodeMapping): Episode | undefined {
        if (epBinding) {
            return this.getEpisodeByIdAndProvider(epBinding.id, epBinding.provider);
        }
    }

    private getEpisodeByIdAndProvider(id: string, providerName: string): Episode | undefined {
        const provider = this.series.getAllProviderLocalDatas().find(x => x.provider == providerName);
        if (provider) {
            return provider.detailEpisodeInfo.find(x => x.id === id);
        } else {
            throw new Error('Provider ' + providerName + ' not found in series: ' + this.series.id);
        }
    }
}
