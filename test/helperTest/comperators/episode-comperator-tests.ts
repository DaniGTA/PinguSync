import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager'
import Episode from '../../../src/backend/controller/objects/meta/episode/episode'
import EpisodeTitle from '../../../src/backend/controller/objects/meta/episode/episode-title'
import { EpisodeType } from '../../../src/backend/controller/objects/meta/episode/episode-type'
import Season from '../../../src/backend/controller/objects/meta/season'
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list'
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result'
import EpisodeComperator from '../../../src/backend/helpFunctions/comperators/episode-comperator'
import TestListProvider from '../../controller/objects/testClass/testListProvider'
import TestListProvider2 from '../../controller/objects/testClass/testListProvider2'

// tslint:disable: no-string-literal
describe('Episode comperator | Full test', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider(), new TestListProvider2()]
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = []
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = []
    })
    describe('season tests', () => {
        const aEpisode = new Episode(0, new Season([1]))
        const bEpisode = new Episode(0)
        test('should compare seasons right (missing providerB season)', () => {
            // tslint:disable-next-line: no-string-literal
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                bEpisode,
                new Season([1]),
                undefined,
                new Season([1])
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).toBe(resultA.matches)
        })
        test('should compare seasons right (missing providerA season)', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                bEpisode,
                undefined,
                new Season([1]),
                new Season([1])
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).toBe(resultA.matches)
        })
        test('should compare seasons right (missing all provider season)', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                bEpisode,
                undefined,
                undefined,
                new Season([1])
            )
            const resultB = EpisodeComperator['isEpisodeSameSeason'](
                bEpisode,
                aEpisode,
                undefined,
                undefined,
                new Season([1])
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).toBe(resultA.matches)
            expect(resultB.matchAble).not.toBe(0)
            expect(resultB.matchAble).toBe(resultB.matches)
        })
        test('should compare seasons right (missing series season)', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                bEpisode,
                new Season([1]),
                new Season([1]),
                undefined
            )
            const resultB = EpisodeComperator['isEpisodeSameSeason'](
                bEpisode,
                aEpisode,
                new Season([1]),
                new Season([1]),
                undefined
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).toBe(resultB.matches)
        })
        test('should compare seasons right (missing provider season and series season)', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                bEpisode,
                undefined,
                undefined,
                undefined
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).toBe(resultA.matches)
        })
        test('should compare seasons right (missing provider season and series season) v2', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                bEpisode,
                aEpisode,
                undefined,
                undefined,
                undefined
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).toBe(resultA.matches)
        })

        test('should compare seasons false', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                bEpisode,
                undefined,
                undefined,
                new Season(2)
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).not.toBe(resultA.matches)
        })
        test('should compare seasons right (no missing seasons)', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                aEpisode,
                new Season([1]),
                new Season([1]),
                new Season([1])
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).toBe(resultA.matches)
        })
        test('should compare seasons false (false provider season)', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                bEpisode,
                new Season([1]),
                new Season(2),
                new Season([1])
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).not.toBe(resultA.matches)
        })
        test('should compare seasons false (false series season)', () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](
                aEpisode,
                bEpisode,
                undefined,
                undefined,
                new Season(2)
            )
            expect(resultA.matchAble).not.toBe(0)
            expect(resultA.matchAble).not.toBe(resultA.matches)
        })
    })

    test('should compare the episode as not the same', () => {
        const episodeA = new Episode(2, undefined)
        episodeA.provider = 'AniList'
        episodeA.type = EpisodeType.REGULAR_EPISODE

        const episodeB = new Episode(1, new Season([1]))
        episodeB.title.push(new EpisodeTitle('test'))
        episodeB.type = EpisodeType.UNKOWN
        episodeB.providerEpisodeId = 123

        const result = EpisodeComperator.compareDetailedEpisode(
            episodeA,
            episodeB,
            undefined,
            undefined,
            new Season([2]),
            0
        )
        expect(result.matchAble).toBe(6)
        expect(result.matches).toBe(0)
    })

    test('should compare the episode as the same', () => {
        const episodeA = new Episode(2, undefined)
        episodeA.type = EpisodeType.OTHER
        episodeA.summery = 'ABC'
        episodeA.title.push(new EpisodeTitle('X', 'X'))
        episodeA.title.push(new EpisodeTitle('ABC', 'ABC'))
        episodeA.title.push(new EpisodeTitle('Y', 'Y'))
        episodeA.title.push(new EpisodeTitle('ABC', 'ABC2'))

        const episodeB = new Episode(2, new Season([1]))
        episodeB.title.push(new EpisodeTitle('ABC'))
        episodeB.type = EpisodeType.UNKOWN
        episodeB.providerEpisodeId = 123

        const result = EpisodeComperator.isSameEpisodeTitle(episodeA, episodeB)
        expect(result.matchAble).toBe(1)
        expect(result.matches).toBe(1)
        expect(result.isAbsolute).toBe(AbsoluteResult.ABSOLUTE_TRUE)
    })

    test('should be the same Episode title', () => {
        const episodeA = new Episode(1, undefined, [new EpisodeTitle('Final Flame for This Over-the-Top Fortress!')])
        const episodeB = new Episode(1, undefined, [new EpisodeTitle('Final Flame for this Over-the-top Fortress!')])
        const result = EpisodeComperator.isSameEpisodeTitle(episodeA, episodeB)

        expect(result.isAbsolute).toBe(AbsoluteResult.ABSOLUTE_TRUE)
    })

    describe('compares simple episode number vs detailed episode', () => {
        test('same ep 0 s0 (should return true)', () => {
            const detailedEpisode = new Episode(0, new Season(0))
            const result = EpisodeComperator.isEpisodeSameAsDetailedEpisode(0, detailedEpisode, new Season([0]))

            expect(result).toBeTruthy()
        })

        test('same ep 1 s1 (should return true)', () => {
            const detailedEpisode = new Episode(1, new Season([1]))
            const result = EpisodeComperator.isEpisodeSameAsDetailedEpisode(1, detailedEpisode, new Season([1]))

            expect(result).toBeTruthy()
        })

        test('different ep 1 s1 and ep 2 s1 (should return false)', () => {
            const detailedEpisode = new Episode(1, new Season([1]))
            const result = EpisodeComperator.isEpisodeSameAsDetailedEpisode(2, detailedEpisode, new Season([1]))

            expect(result).toBeFalsy()
        })
    })

    describe('checks if episode title are equals or not equals', () => {
        test('should be equels (should ignore case)', () => {
            const result = EpisodeComperator['isEpisodeTitleEquals']('Title', 'title')
            expect(result).toBeTruthy()
        })

        test('should be equels (special charactar: ")', () => {
            const result = EpisodeComperator['isEpisodeTitleEquals']('"Ma" and "La"', '"Ma" and "La" ')
            expect(result).toBeTruthy()
        })

        test('should be equels (should ignore: The)', () => {
            const result = EpisodeComperator['isEpisodeTitleEquals']('Title: the title', 'title: title')
            expect(result).toBeTruthy()
        })

        test('should be equels (should ignore: and)', () => {
            const result = EpisodeComperator['isEpisodeTitleEquals']('Title & title', 'title and title')
            expect(result).toBeTruthy()
        })

        test('shoueld be equals (should split: -)', () => {
            const result = EpisodeComperator['isEpisodeTitleEquals']('File 1 - test', 'test')
        })
    })

    describe('checks if episode a season number is higher then episode b or not', () => {
        test('should be false | same season (not higher)', () => {
            const episodeA = new Episode(1, new Season([1]))
            const episodeB = new Episode(1, new Season([1]))
            const resultA = EpisodeComperator.isEpisodeASeasonHigher(episodeA, episodeB)
            expect(resultA).toBeFalsy()
        })

        test('should be false | same season with series season (not higher)', () => {
            const episodeA = new Episode(1, new Season([1]))
            const episodeB = new Episode(1)
            const resultA = EpisodeComperator.isEpisodeASeasonHigher(episodeA, episodeB, new Season([1]))
            expect(resultA).toBeFalsy()
        })

        test('should be true | higher season', () => {
            const episodeA = new Episode(1, new Season([1]))
            const episodeB = new Episode(1, new Season(2))
            const resultA = EpisodeComperator.isEpisodeASeasonHigher(episodeA, episodeB)
            expect(resultA).toBeTruthy()
        })

        test('should be true | higher season with series season for season b', () => {
            const episodeA = new Episode(1, new Season([1]))
            const episodeB = new Episode(1)
            const resultA = EpisodeComperator.isEpisodeASeasonHigher(episodeA, episodeB, new Season(2))
            expect(resultA).toBeTruthy()
        })

        test('should be true | higher season b with series season for season a', () => {
            const episodeA = new Episode(1)
            const episodeB = new Episode(1, new Season(2))
            const resultA = EpisodeComperator.isEpisodeASeasonHigher(episodeA, episodeB, new Season([1]))
            expect(resultA).toBeTruthy()
        })
        test('should be false | lower season', () => {
            const episodeA = new Episode(1, new Season(2))
            const episodeB = new Episode(1, new Season([1]))
            const resultA = EpisodeComperator.isEpisodeASeasonHigher(episodeA, episodeB)
            expect(resultA).toBeFalsy()
        })

        test('should be false | lower season with series season', () => {
            const episodeA = new Episode(1, new Season(2))
            const episodeB = new Episode(1)
            const resultA = EpisodeComperator.isEpisodeASeasonHigher(episodeA, episodeB, new Season([1]))
            expect(resultA).toBeFalsy()
        })

        test('should be false | undefined season', () => {
            const episodeA = new Episode(1)
            const episodeB = new Episode(1)
            const resultA = EpisodeComperator.isEpisodeASeasonHigher(episodeA, episodeB)
            expect(resultA).toBeFalsy()
        })
    })

    describe('isEpisodeTitleTooUnlikleToBeEquals() tests', () => {
        test('should not be likley enough', () => {
            const result = EpisodeComperator['isEpisodeTitleTooUnlikleToBeEquals'](
                'teeeeeest',
                'teeeeeeeeeeeeeeeeeeeeeeeeest'
            )
            expect(result).toBeTruthy()
        })

        test('should be likley enough', () => {
            const result = EpisodeComperator['isEpisodeTitleTooUnlikleToBeEquals']('teeeeeest', 'teeeeeeeeeest')
            expect(result).toBeFalsy()
        })
    })
})
