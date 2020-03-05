import { equal, notEqual, rejects, strictEqual } from 'assert';
import StringHelper from '../../src/backend/helpFunctions/string-helper';

describe('String Helper', () => {
    beforeEach(() => {
    });
    test('should generate a randome string', async () => {
        notEqual(StringHelper.randomString(), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
        notEqual(StringHelper.randomString(), '');
        notEqual(typeof StringHelper.randomString(), 'undefined');
        notEqual(StringHelper.randomString(), null);
        return;
    });
    describe('should clean string', () => {
        test('should clean string: Title ~Title!~', () => {
            strictEqual(StringHelper.cleanString('Title ~Title!~'), 'Title Title');
        });
        test('should clean string: Test.', () => {
            strictEqual(StringHelper.cleanString('Test.'), 'Test');
        });
        test('should clean string: Title -test-', () => {
            strictEqual(StringHelper.cleanString('Title -test-'), 'Title test');
        });
        test('should clean string: Title-test', () => {
            strictEqual(StringHelper.cleanString('Title-test'), 'Title test');
        });
        test('should clean string: Title \'test\'', () => {
            strictEqual(StringHelper.cleanString('Title \'test\''), 'Title test');
        });
        test('should clean string: Title!!', () => {
            strictEqual(StringHelper.cleanString('Title!!'), 'Title!!');
        });
        test('should clean string: Title: test', () => {
            strictEqual(StringHelper.cleanString('Title: test'), 'Title test');
        });
        test('should clean string: Title  test', () => {
            strictEqual(StringHelper.cleanString('Title  test'), 'Title test');
        });
        test('should clean string: Title`Title`', () => {
            strictEqual(StringHelper.cleanString('Title`Title`'), 'TitleTitle');
        });
    });

    test('should clean string of other characters', async () => {
        strictEqual(await StringHelper.cleanString('この素晴らしい世界に祝福を！紅伝説'), 'この素晴らしい世界に祝福を 紅伝説');
        strictEqual(await StringHelper.cleanString('この素晴らしい世界に祝福を! 紅伝説'), 'この素晴らしい世界に祝福を 紅伝説');
    });
    test('should not crash on check kanij', async () => {
        strictEqual(await StringHelper.hasKanji(null as unknown as string), false);
    });

    test('should detect cryillic', async () => {
        strictEqual(await StringHelper.hasCyrillic('Привіт'), true);
        return;
    });

    test('should not detect cryillic', async () => {
        strictEqual(await StringHelper.hasCyrillic('Hello'), false);
        return;
    });

    test('should detect hangul letters', async () => {
        strictEqual(await StringHelper.hasHangul('안녕'), true);
        return;
    });

    test('should not detect hangul letters', async () => {
        strictEqual(await StringHelper.hasHangul('Hello'), false);
        return;
    });

    test('should make test to tset', async () => {
        const result = await StringHelper.reverseString('test');
        equal(result, 'tset');
        return;
    });

    describe('should detect basic latin', () => {
        test('should detect basic latin letters', () => {
            strictEqual(StringHelper.isOnlyBasicLatin('Test: - 2'), true);
            strictEqual(StringHelper.isOnlyBasicLatin('Test/test! - 2 (1990)'), true);
            return;
        });
        test('should detect that is it no basic latin letters', () => {
            strictEqual(StringHelper.isOnlyBasicLatin('この素晴らしい世界に祝福を! 紅伝説'), false);
            strictEqual(StringHelper.isOnlyBasicLatin('Test: Привіт - 2'), false);
            strictEqual(StringHelper.isOnlyBasicLatin('Test/test! - 2 (1990) 안녕'), false);
            return;
        });
    });

    describe('should get right season number from title', () => {
        test('should detect parts', async () => {
            strictEqual((await StringHelper.getSeasonNumberFromTitle('Title 3 Part 2')).seasonNumber, 3);
        });
        test('Season marking with X', async () => {
            strictEqual((await StringHelper.getSeasonNumberFromTitle('Title XX')).seasonNumber, 2, 'Season marking with X');
        });
        test('Season marking with number', async () => {
            strictEqual((await StringHelper.getSeasonNumberFromTitle('Title 2')).seasonNumber, 2, 'Season marking with number');
        });
        test('Season marking with the letter s', async () => {
            strictEqual((await StringHelper.getSeasonNumberFromTitle('Title S2')).seasonNumber, 2, 'Season marking with the letter s');
        });
        test('Season marking with the word season', async () => {
            strictEqual((await StringHelper.getSeasonNumberFromTitle('Title Season 2 - The war')).seasonNumber, 2, 'Season marking with the word season');
        });
        test('Season marking with the a A', async () => {
            strictEqual((await StringHelper.getSeasonNumberFromTitle('Title AA')).seasonNumber, 2, 'Season marking with the a A');
        });
        test('should get season number 2 from title: アルドノア・ゼロ 2', async () => {
            strictEqual((await StringHelper.getSeasonNumberFromTitle('アルドノア・ゼロ 2')).seasonNumber, 2, 'test 2');
        });
    });

    test('should not get a season number from title', async () => {
        await rejects(StringHelper.getSeasonNumberFromTitle('14'), 'number is not a season.');
        await rejects(StringHelper.getSeasonNumberFromTitle('C3'), '2 values cant give a season');
        await rejects(StringHelper.getSeasonNumberFromTitle('C^3'), 'high 3 is not a season number');
        await rejects(StringHelper.getSeasonNumberFromTitle('A Melancolia de Haruhi Suzumiya'));
        await rejects(StringHelper.getSeasonNumberFromTitle('Title'), 'there is no season');
        await rejects(StringHelper.getSeasonNumberFromTitle('Title 2006'), 'a year is not a season');
        await rejects(StringHelper.getSeasonNumberFromTitle('Title AAA'), 'triple a is not a season marker');
        await rejects(StringHelper.getSeasonNumberFromTitle('Title A'), 'single a is not a season marker');
    });

});
