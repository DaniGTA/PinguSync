import EpisodeBindingManager from '../../../src/backend/controller/episode-binding-controller/episode-binding-manager'
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager'
import Episode from '../../../src/backend/controller/objects/meta/episode/episode'
import EpisodeTitle from '../../../src/backend/controller/objects/meta/episode/episode-title'
import Season from '../../../src/backend/controller/objects/meta/season'
import Series from '../../../src/backend/controller/objects/series'
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list'
import EpisodeBindingPoolHelper from '../../../src/backend/helpFunctions/episode-binding-pool-helper'
import EpisodeMappingHelper from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-mapping-helper'
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info'
import TestInfoProvider from '../../controller/objects/testClass/testInfoProvider'
import TestListProvider from '../../controller/objects/testClass/testListProvider'
import TestListProvider2 from '../../controller/objects/testClass/testListProvider2'

describe('Episode mapping | Name Mapping Tests Only', () => {
    beforeEach(() => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider(), new TestListProvider2()]
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = []
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = []
        ProviderDataListManager['providerDataList'] = []
        EpisodeBindingManager['episodeBindingPoolDataList'] = []
    })

    test('should map by episode name', async () => {
        const aSeries = new Series()

        // A Site

        const aProvider = new InfoProviderLocalData('1', TestInfoProvider)
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Second round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Third round')]))

        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])))

        // B Site

        const bProvider = new ListProviderLocalData('1', TestListProvider)
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])))
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('First round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1]), [new EpisodeTitle('Second round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1]), [new EpisodeTitle('Third rounds')]))
        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])))

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries)

        // Extract results.

        const aEpisodeInfo1 = aProvider
            .getAllDetailedEpisodes()
            .find(x => x.id === aProvider.getAllDetailedEpisodes()[0].id)
        const aEpisodeInfo2 = aProvider
            .getAllDetailedEpisodes()
            .find(x => x.id === aProvider.getAllDetailedEpisodes()[1].id)
        const aEpisodeInfo3 = aProvider
            .getAllDetailedEpisodes()
            .find(x => x.id === aProvider.getAllDetailedEpisodes()[2].id)

        const bEpisodeInfo1 = bProvider
            .getAllDetailedEpisodes()
            .find(x => x.id === bProvider.getAllDetailedEpisodes()[0].id)
        const bEpisodeInfo2 = bProvider
            .getAllDetailedEpisodes()
            .find(x => x.id === bProvider.getAllDetailedEpisodes()[1].id)
        const bEpisodeInfo3 = bProvider
            .getAllDetailedEpisodes()
            .find(x => x.id === bProvider.getAllDetailedEpisodes()[2].id)
        const bEpisodeInfo4 = bProvider
            .getAllDetailedEpisodes()
            .find(x => x.id === bProvider.getAllDetailedEpisodes()[3].id)

        // Result checking
        if (
            !(
                aEpisodeInfo1 &&
                aEpisodeInfo2 &&
                aEpisodeInfo3 &&
                bEpisodeInfo1 &&
                bEpisodeInfo2 &&
                bEpisodeInfo3 &&
                bEpisodeInfo4
            )
        ) {
            throw new Error('not all episodes found in the result')
        } else {
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id).toBe(
                bEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id).toBe(
                bEpisodeInfo3.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id).toBe(
                bEpisodeInfo4.id
            )

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length).toBe(0)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id).toBe(
                aEpisodeInfo1.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id).toBe(
                aEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4)[0].id).toBe(
                aEpisodeInfo3.id
            )
        }
    })

    test('should map random wrong name but right order', async () => {
        const aSeries = new Series()

        // A Site

        const aProvider = new InfoProviderLocalData('1', TestInfoProvider)
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('First round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Second round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(4, undefined, [new EpisodeTitle('Third round')]))

        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])))

        // B Site

        const bProvider = new ListProviderLocalData('1', TestListProvider)
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1]), [new EpisodeTitle('First round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('Seconds rounds')]))
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1]), [new EpisodeTitle('Third round')]))
        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])))

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries)

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0]
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1]
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2]

        const bEpisodeInfo1 = bProvider.getAllDetailedEpisodes()[0]
        const bEpisodeInfo2 = bProvider.getAllDetailedEpisodes()[1]
        const bEpisodeInfo3 = bProvider.getAllDetailedEpisodes()[2]

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3)) {
            throw new Error('not all episodes found in the result')
        } else {
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id).toBe(
                bEpisodeInfo1.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id).toBe(
                bEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id).toBe(
                bEpisodeInfo3.id
            )

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id).toBe(
                aEpisodeInfo1.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id).toBe(
                aEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id).toBe(
                aEpisodeInfo3.id
            )
        }
    })

    test('should map by episode name (false name)', async () => {
        const aSeries = new Series()

        // A Site

        const aProvider = new InfoProviderLocalData('1', TestInfoProvider)
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Second round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Third round')]))

        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])))
        // B Site

        const bProvider = new ListProviderLocalData('1', TestListProvider)
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1]), [new EpisodeTitle('Special round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('First round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1]), [new EpisodeTitle('Second round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1]), [new EpisodeTitle('Thrid round')]))
        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])))

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries)

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0]
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1]
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2]

        const bEpisodeInfo1 = bProvider.getAllDetailedEpisodes()[0]
        const bEpisodeInfo3 = bProvider.getAllDetailedEpisodes()[2]
        const bEpisodeInfo4 = bProvider.getAllDetailedEpisodes()[3]
        const bEpisodeInfo2 = bProvider.getAllDetailedEpisodes()[1]

        // Result checking
        if (
            !(
                aEpisodeInfo1 &&
                aEpisodeInfo2 &&
                aEpisodeInfo3 &&
                bEpisodeInfo1 &&
                bEpisodeInfo2 &&
                bEpisodeInfo3 &&
                bEpisodeInfo4
            )
        ) {
            throw new Error('not all episodes found in the result')
        } else {
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id).toBe(
                bEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id).toBe(
                bEpisodeInfo3.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id).toBe(
                bEpisodeInfo4.id
            )

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length).toBe(0)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id).toBe(
                aEpisodeInfo1.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id).toBe(
                aEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4)[0].id).toBe(
                aEpisodeInfo3.id
            )
        }
    })

    test('should map by episode name (small info)', async () => {
        const aSeries = new Series()

        // A Site

        const aProvider = new InfoProviderLocalData('1', TestInfoProvider)
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(2))
        aProvider.addDetailedEpisodeInfos(new Episode(3))

        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])))

        // B Site

        const bProvider = new ListProviderLocalData('1', TestListProvider)
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1]), [new EpisodeTitle('Special round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('First round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])))
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1])))
        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])))

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries)

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0]
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1]
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2]

        const bEpisodeInfo1 = bProvider.getAllDetailedEpisodes()[0]
        const bEpisodeInfo2 = bProvider.getAllDetailedEpisodes()[1]
        const bEpisodeInfo3 = bProvider.getAllDetailedEpisodes()[2]
        const bEpisodeInfo4 = bProvider.getAllDetailedEpisodes()[3]

        // Result checking
        if (
            !(
                aEpisodeInfo1 &&
                aEpisodeInfo2 &&
                aEpisodeInfo3 &&
                bEpisodeInfo1 &&
                bEpisodeInfo2 &&
                bEpisodeInfo3 &&
                bEpisodeInfo4
            )
        ) {
            throw new Error('not all episodes found in the result')
        } else {
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id).toBe(
                bEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id).toBe(
                bEpisodeInfo3.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id).toBe(
                bEpisodeInfo4.id
            )

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length).toBe(0)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id).toBe(
                aEpisodeInfo1.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id).toBe(
                aEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4)[0].id).toBe(
                aEpisodeInfo3.id
            )
        }
    })

    test('should map by episode name (small info specials)', async () => {
        const aSeries = new Series()

        // A Site

        const aProvider = new InfoProviderLocalData('1', TestInfoProvider)
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Special round')]))
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Second round')]))

        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])))

        // B Site

        const bProvider = new ListProviderLocalData('1', TestListProvider)
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1]), [new EpisodeTitle('Special round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('First round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1]), [new EpisodeTitle('Second round')]))
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1])))
        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])))

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries)

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0]
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1]
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2]

        const bEpisodeInfo1 = bProvider.getAllDetailedEpisodes()[0]
        const bEpisodeInfo2 = bProvider.getAllDetailedEpisodes()[1]
        const bEpisodeInfo3 = bProvider.getAllDetailedEpisodes()[2]
        const bEpisodeInfo4 = bProvider.getAllDetailedEpisodes()[3]

        // Result checking
        if (
            !(
                aEpisodeInfo1 &&
                aEpisodeInfo2 &&
                aEpisodeInfo3 &&
                bEpisodeInfo1 &&
                bEpisodeInfo2 &&
                bEpisodeInfo3 &&
                bEpisodeInfo4
            )
        ) {
            throw new Error('not all episodes found in the result')
        } else {
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(1)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id).toBe(
                bEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id).toBe(
                bEpisodeInfo1.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id).toBe(
                bEpisodeInfo3.id
            )

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length).toBe(1)
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4).length).toBe(0)

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id).toBe(
                aEpisodeInfo2.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id).toBe(
                aEpisodeInfo1.id
            )
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id).toBe(
                aEpisodeInfo3.id
            )
        }
    })
})
