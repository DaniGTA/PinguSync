import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import Series from '../../controller/objects/series';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import EpisodeComperator from '../comperators/episode-comperator';
import ListController from '../../controller/list-controller';

export default class EpisodeMappingHelper{
    
    async generateEpisodeMapping(series: Series): Promise<Episode[]> {
        const providers = series.getAllProviderLocalDatas();
        const season = (await series.getSeason()).seasonNumber;
        for (const providerA of providers) {
             let mappedCounter = 0;
            for (let detailedEpisodeA of providerA.detailEpisodeInfo) {
                const mappingA = new EpisodeMapping(detailedEpisodeA, providerA);
                for (const providerB of providers) {
                   
                    if (await this.episodeIsAlreadyMapped(detailedEpisodeA, providerB) || providerA.provider == providerB.provider) {
                        continue;
                    }
                    for (let detailedEpisodeB of providerB.detailEpisodeInfo) {
                        const mappingB = new EpisodeMapping(detailedEpisodeB, providerB);
                        if (EpisodeComperator.isSameEpisode(detailedEpisodeA, detailedEpisodeB, season)) {
                            detailedEpisodeA = await this.addMappingToEpisode(mappingB, detailedEpisodeA);
                            detailedEpisodeB = await this.addMappingToEpisode(mappingA, detailedEpisodeB);
                            mappedCounter++;
                            continue;
                        }
                    }
                }
            }
            if (providerA.detailEpisodeInfo.length < mappedCounter && ListController.instance) {
                const sequel = series.getSequel(await ListController.instance.getMainList());
                
            }
        }
        const episodes = providers.flatMap(x => x.detailEpisodeInfo);
        return episodes;
    }

    private async episodeIsAlreadyMapped(episode: Episode, provider: ProviderLocalData): Promise<boolean> {
        for (const episodeMapping of episode.mappedTo) {
            if (episodeMapping.provider == provider.provider && episodeMapping.mappingVersion == EpisodeMapping.currentMappingVersion) {
                return true;
            }
        }
        return false;
    }

    public async addMappingToEpisode(mapping: EpisodeMapping, episode: Episode): Promise<Episode> {
        let added = false;
        for (const currentMapping of episode.mappedTo) {
            if (mapping.provider == mapping.provider) {
                const index = episode.mappedTo.indexOf(currentMapping);
                episode.mappedTo[index] = mapping;
                added = true;
                break;
            }
        }
        if (!added) {
            episode.mappedTo.push(mapping);
        }
        return episode;
    }
}