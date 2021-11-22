import EpisodeBindingPool from '../objects/meta/episode/episode-binding-pool'
import EpisodeBindingPoolReference from '../objects/meta/episode/episode-binding-pool-reference'
import EpisodeBindingLoader from './episode-binding-loader'
import EpisodeBindingSearcher from './episode-binding-searcher'

export default class EpisodeBindingManager {
    private static debounceSaving?: NodeJS.Timeout
    private static episodeBindingPoolDataList: EpisodeBindingPool[] = []
    private static listLoaded = false

    public static add(provider: EpisodeBindingPool) {
        if (provider.bindedEpisodeMappings.length === 0) {
            throw new Error('Cannot add provider with no episode mappings')
        }
        const existingPoolIndex = EpisodeBindingSearcher.findExistingBindedPoolIndex(provider)
        if (existingPoolIndex != undefined) {
            this.episodeBindingPoolDataList[existingPoolIndex].addEpisodeMappingToBindings(
                ...provider.bindedEpisodeMappings
            )
            return new EpisodeBindingPoolReference(
                this.episodeBindingPoolDataList[existingPoolIndex].id,
                existingPoolIndex
            )
        } else {
            this.episodeBindingPoolDataList.push(provider)
            return new EpisodeBindingPoolReference(provider.id, this.episodeBindingPoolDataList.length - 1)
        }
    }

    public static remove(episodePoolReference: EpisodeBindingPoolReference) {
        this.checkIfListIsLoaded()
        const existingPoolIndex = EpisodeBindingSearcher.getIndexFromEpisodeBindingPoolReference(episodePoolReference)
        this.removeByIndex(existingPoolIndex)
    }

    public static removeById(id: String) {
        this.checkIfListIsLoaded()
        this.episodeBindingPoolDataList = this.episodeBindingPoolDataList.filter(pool => pool.id !== id)
    }

    public static removeByIndex(index: number) {
        this.checkIfListIsLoaded()
        this.episodeBindingPoolDataList.splice(index, 1)
    }

    public static getList() {
        this.checkIfListIsLoaded()
        return this.episodeBindingPoolDataList
    }

    public static requestSaveProviderList(): void {
        if (this.debounceSaving) clearTimeout(this.debounceSaving)
        this.debounceSaving = setTimeout(() => EpisodeBindingLoader.saveData(this.episodeBindingPoolDataList), 2000)
    }

    private static checkIfListIsLoaded(): void {
        if (!this.listLoaded) {
            this.episodeBindingPoolDataList = EpisodeBindingLoader.loadData()
            this.listLoaded = true
        }
    }
}
