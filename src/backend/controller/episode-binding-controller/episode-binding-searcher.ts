import EpisodeBindingPool from '../objects/meta/episode/episode-binding-pool'
import EpisodeBindingPoolReference from '../objects/meta/episode/episode-binding-pool-reference'
import EpisodeBindingManager from './episode-binding-manager'

export default class EpisodeBindingSearcher {
    /**
     * Get EpisodeBindingPool from the index in binding pool reference or id
     */
    public static getByEpisodeBindingPoolReference(
        episodeBindingPoolReference: EpisodeBindingPoolReference
    ): EpisodeBindingPool {
        if (episodeBindingPoolReference.index != -1) {
            const indexFound = this.getEpisodeBindingPoolByIndex(episodeBindingPoolReference.index)
            if (indexFound.id === episodeBindingPoolReference.id) {
                return indexFound
            }
        }
        return this.getEpisodeBindingPoolByID(episodeBindingPoolReference.id)
    }

    /** Get index from EpisodeBindingPoolReference */
    public static getIndexFromEpisodeBindingPoolReference(episodeBindingPoolReference: EpisodeBindingPoolReference) {
        const list = EpisodeBindingManager.getList()
        if (
            episodeBindingPoolReference.index != -1 &&
            list[episodeBindingPoolReference.index].id === episodeBindingPoolReference.id
        ) {
            return episodeBindingPoolReference.index
        }
        return list.findIndex(x => x.id === episodeBindingPoolReference.id)
    }

    public static getEpisodeBindingPoolByIndex(index: number): EpisodeBindingPool {
        return EpisodeBindingManager.getList()[index]
    }

    public static getEpisodeBindingPoolByID(id: string): EpisodeBindingPool {
        const list = EpisodeBindingManager.getList()
        const index = list.findIndex(x => x.id === id)
        if (index === -1) {
            throw new Error(`EpisodeBindingPool with id ${id} not found`)
        }
        return list[index]
    }

    /**
     * Should find existing episode Mapping in EpisodeBindingPool from an Episode binding pool.
     */
    public static findExistingBindedPoolIndex(provider: EpisodeBindingPool) {
        for (const episodeMapping of provider.bindedEpisodeMappings) {
            const existingPoolIndex = EpisodeBindingManager.getList().findIndex(x =>
                x.bindingPoolHasEpisodeMapping(episodeMapping)
            )
            if (existingPoolIndex != -1) {
                return existingPoolIndex
            }
        }
    }
}
