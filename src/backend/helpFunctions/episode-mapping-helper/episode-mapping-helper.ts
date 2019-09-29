import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import Series from '../../controller/objects/series';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import EpisodeComperator from '../comperators/episode-comperator';
import ListController from '../../controller/list-controller';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';

export default class EpisodeMappingHelper{
    
    async generateEpisodeMapping(series: Series): Promise<Episode[]> {
        const providers = series.getAllProviderLocalDatas();
        const season = (await series.getSeason()).seasonNumber;

        for (const providerA of providers) {
            if (providerA.episodes) {
                if (providerA.episodes > await providerA.getDetailedEpisodeLength()) {
                    const generatedEpisodes = await this.generateMissingEpisodes(providerA,season);
                    providerA.detailEpisodeInfo.push(...generatedEpisodes);
                }
            }
            let mappedCounter = 0;
            for (let detailedEpisodeA of providerA.detailEpisodeInfo) {
                const mappingA = new EpisodeMapping(detailedEpisodeA, providerA);
                for (const providerB of providers) {
                   
                    if (await this.episodeIsAlreadyMapped(detailedEpisodeA, providerB) || providerA.provider == providerB.provider) {
                        continue;
                    }
                    for (let detailedEpisodeB of providerB.detailEpisodeInfo) {
                        const mappingB = new EpisodeMapping(detailedEpisodeB, providerB);
                        if (await EpisodeComperator.isSameEpisode(detailedEpisodeA, detailedEpisodeB, season)) {
                            detailedEpisodeA = await this.addMappingToEpisode(mappingB, detailedEpisodeA);
                            detailedEpisodeB = await this.addMappingToEpisode(mappingA, detailedEpisodeB);
                            mappedCounter++;
                            break;
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

    private async generateMissingEpisodes(provider: ProviderLocalData, season?: number): Promise<Episode[]> {
        const generatedEpisodes: Episode[] = [];
        if (provider.episodes) {
            const numberOfMissingEpisodes = provider.episodes - await provider.getDetailedEpisodeLength();
            for (let episode = 1; episode <= numberOfMissingEpisodes; episode++) {
                let episodeFounded = false;
                for (const detailedEpisode of provider.detailEpisodeInfo) {
                    if (await EpisodeComperator.isEpisodeSameAsDetailedEpisode(episode, detailedEpisode, season)) {
                        episodeFounded = true;
                        break;
                    }
                }
                if (!episodeFounded) {
                    const tempEpisode = new Episode(episode);
                    tempEpisode.provider = provider.provider;
                    tempEpisode.type = EpisodeType.REGULAR_EPISODE;
                    generatedEpisodes.push(tempEpisode);
                }
            }
        }
        return generatedEpisodes;
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