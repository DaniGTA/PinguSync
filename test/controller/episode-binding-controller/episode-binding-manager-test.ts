import EpisodeBindingManager from '../../../src/backend/controller/episode-binding-controller/episode-binding-manager'
import Episode from '../../../src/backend/controller/objects/meta/episode/episode'
import EpisodeBindingPool from '../../../src/backend/controller/objects/meta/episode/episode-binding-pool'
import EpisodeMapping from '../../../src/backend/controller/objects/meta/episode/episode-mapping'
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list'
import TestListProvider from '../objects/testClass/testListProvider'
import TestListProvider2 from '../objects/testClass/testListProvider2'

describe('Episode binding manager test', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider(), new TestListProvider2()]
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = []
        EpisodeBindingManager['episodeBindingPoolDataList'] = []
    })

    /**
     * Test the episode binding manager. By adding multiple episode bindings..
     */
    test('should not add duplicate', () => {
        const a = new EpisodeBindingPool(
            new EpisodeMapping(new Episode(1), new ListProviderLocalData(1, TestListProvider))
        )
        EpisodeBindingManager.add(a)
        EpisodeBindingManager.add(a)

        expect(EpisodeBindingManager.getList().length).toBe(1)
    })
    /**
     * Test the episode binding manager. By adding multiple episode bindings..
     */
    test('should not add different duplicates', () => {
        const mapping = new EpisodeMapping(new Episode(1), new ListProviderLocalData(1, TestListProvider))
        const a = new EpisodeBindingPool(mapping)
        const b = new EpisodeBindingPool(mapping)

        EpisodeBindingManager.add(a)
        EpisodeBindingManager.add(b)

        expect(EpisodeBindingManager.getList().length).toBe(1)
    })
    /**
     * Should add new Mappings
     */
    test('should merge duplicates', () => {
        const mapping = new EpisodeMapping(new Episode(1), new ListProviderLocalData(1, TestListProvider))
        const a = new EpisodeBindingPool(mapping)
        const mapping2 = new EpisodeMapping(new Episode(2), new ListProviderLocalData(2, TestListProvider2))
        const b = new EpisodeBindingPool(mapping, mapping2)

        EpisodeBindingManager.add(a)
        EpisodeBindingManager.add(b)

        expect(EpisodeBindingManager.getList().length).toBe(1)
        expect(EpisodeBindingManager.getList()[0].bindedEpisodeMappings[1].episodeNumber).toBe(2)
    })

    /**
     * Should add new Mappings
     */
    test('should remove by id', () => {
        const mapping = new EpisodeMapping(new Episode(1), new ListProviderLocalData(1, TestListProvider))
        const a = new EpisodeBindingPool(mapping)
        const mapping2 = new EpisodeMapping(new Episode(2), new ListProviderLocalData(2, TestListProvider2))
        const b = new EpisodeBindingPool(mapping2)
        const mapping3 = new EpisodeMapping(new Episode(3), new ListProviderLocalData(2, TestListProvider2))
        const c = new EpisodeBindingPool(mapping3)

        EpisodeBindingManager.add(a)
        EpisodeBindingManager.add(b)
        EpisodeBindingManager.add(c)

        EpisodeBindingManager.removeById(b.id)

        expect(EpisodeBindingManager.getList().length).toBe(2)
        expect(EpisodeBindingManager.getList()[0].id).toBe(a.id)
        expect(EpisodeBindingManager.getList()[1].id).toBe(c.id)
    })
})
