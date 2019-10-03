import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import Series from '../../controller/objects/series';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import EpisodeComperator from '../comperators/episode-comperator';
import ListController from '../../controller/list-controller';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import sortHelper from '../sort-helper';
import EpisodeRatedEqualityContainer from './episode-rated-equality-container';

export default class EpisodeMappingHelper{
    
    async generateEpisodeMapping(series: Series): Promise<Episode[]> {
        const providers = series.getAllProviderLocalDatas();
        const season = (await series.getSeason()).seasonNumber;
        for (const provider of providers) {
             if (provider.episodes) {
                if (provider.episodes > await provider.getDetailedEpisodeLength()) {
                    const generatedEpisodes = await this.generateMissingEpisodes(provider,season);
                    provider.detailEpisodeInfo.push(...generatedEpisodes);
                }
            }
        }
        for (const providerA of providers) {
           
            let mappedCounter = 0;
            for (let detailedEpisodeA of providerA.detailEpisodeInfo) {
                const mappingA = new EpisodeMapping(detailedEpisodeA, providerA);
                for (const providerB of providers) {
                     if (await this.episodeIsAlreadyMapped(detailedEpisodeA, providerB) || providerA.provider == providerB.provider) {
                        continue;
                    }
                    const ratedEquality:EpisodeRatedEqualityContainer[] = [];
                    for (let detailedEpisodeB of providerB.detailEpisodeInfo) {                        
                        const result = await EpisodeComperator.compareDetailedEpisode(detailedEpisodeA, detailedEpisodeB, season);
                        const container = new EpisodeRatedEqualityContainer(result, detailedEpisodeB);
                        ratedEquality.push(container);
                    }
                    const episodeB = await this.getBestResultFromEpisodeRatedEqualityContainer(ratedEquality);
                    const mappingB = new EpisodeMapping(episodeB, providerB);
                    detailedEpisodeA.mappedTo.push(mappingB);
                    episodeB.mappedTo.push(mappingA);
                }
            }
            if (providerA.detailEpisodeInfo.length < mappedCounter && ListController.instance) {
                const sequel = series.getSequel(await ListController.instance.getMainList());
                
            }
        }
        const episodes = providers.flatMap(x => x.detailEpisodeInfo);
        return episodes;
    }

    private async getBestResultFromEpisodeRatedEqualityContainer(ratedEquality:EpisodeRatedEqualityContainer[]): Promise<Episode> {
        const sorted = await sortHelper.quickSort(ratedEquality, (a, b) => b.result.matches - a.result.matches);
        return sorted[0].episode;
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

    public async sortingEpisodeListByEpisodeNumber(episodes: Episode[],season?:number): Promise<Episode[]> {
        return sortHelper.quickSort(episodes, async (a, b) => await this.sortingEpisodeComperator(a, b, season));
    }

    public async sortingEpisodeComperator(a: Episode, b: Episode, season?: number): Promise<number> {
        if ((a.type == EpisodeType.SPECIAL && b.type != EpisodeType.SPECIAL)) {
            return 1;
        } else if (b.type == EpisodeType.SPECIAL && a.type != EpisodeType.SPECIAL) {
            return -1;
        }
        if (await EpisodeComperator.isEpisodeSameSeason(a, b, season)) {
            if (a.episodeNumber > b.episodeNumber) {
                return 1
            } else {
                return -1
            }
        } else if (await EpisodeComperator.isEpisodeASeasonHigher(a, b, season)) {
            return 1;
        } else {
            return -1;
        }
    }


}