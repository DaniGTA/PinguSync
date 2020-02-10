import * as assert from 'assert';
import stringHelper from '../../src/backend/helpFunctions/string-helper';
import TestHelper from '../test-helper';
describe('String Helper', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });
    test('should generate a randome string', async () => {
        assert.notEqual(stringHelper.randomString(), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
        assert.notEqual(stringHelper.randomString(), '');
        assert.notEqual(typeof stringHelper.randomString(), 'undefined');
        assert.notEqual(stringHelper.randomString(), null);
        return;
    });
    describe('should clean string', () => {
        test('should clean string: Title ~Title!~', () => {
            assert.strictEqual(stringHelper.cleanString('Title ~Title!~'), 'Title Title');
        });
        test('should clean string: Test.', () => {
            assert.strictEqual(stringHelper.cleanString('Test.'), 'Test');
        });
        test('should clean string: Title -test-', () => {
            assert.strictEqual(stringHelper.cleanString('Title -test-'), 'Title test');
        });
        test('should clean string: Title-test', () => {
            assert.strictEqual(stringHelper.cleanString('Title-test'), 'Title test');
        });
        test('should clean string: Title \'test\'', () => {
        assert.strictEqual(stringHelper.cleanString('Title \'test\''), 'Title test');
        });
        test('should clean string: Title!!', () => {
        assert.strictEqual(stringHelper.cleanString('Title!!'), 'Title!!');
        });
        test('should clean string: Title: test', () => {
            assert.strictEqual(stringHelper.cleanString('Title: test'), 'Title test');
        });
        test('should clean string: Title  test', () => {
        assert.strictEqual(stringHelper.cleanString('Title  test'), 'Title test');
           });
        test('should clean string: Title`Title`', () => {
        assert.strictEqual(stringHelper.cleanString('Title`Title`'), 'TitleTitle');
        });
    });

    test('should clean string of other characters', async () => {
        assert.strictEqual(await stringHelper.cleanString('この素晴らしい世界に祝福を！紅伝説'), 'この素晴らしい世界に祝福を 紅伝説');
        assert.strictEqual(await stringHelper.cleanString('この素晴らしい世界に祝福を! 紅伝説'), 'この素晴らしい世界に祝福を 紅伝説');
    });
    test('should not crash on check kanij', async () => {
        assert.strictEqual(await stringHelper.hasKanji(null as unknown as string), false);
    });

    test('should detect cryillic', async () => {
        assert.strictEqual(await stringHelper.hasCyrillic('Привіт'), true);
        return;
    });

    test('should not detect cryillic', async () => {
        assert.strictEqual(await stringHelper.hasCyrillic('Hello'), false);
        return;
    });

    test('should detect hangul letters', async () => {
        assert.strictEqual(await stringHelper.hasHangul('안녕'), true);
        return;
    });

    test('should not detect hangul letters', async () => {
        assert.strictEqual(await stringHelper.hasHangul('Hello'), false);
        return;
    });

    test('should make test to tset', async () => {
        const result = await stringHelper.reverseString('test');
        assert.equal(result, 'tset');
        return;
    });
    describe('shoul get right season number from title', () => {
       test('should detect parts', async () => {
            assert.strictEqual((await stringHelper.getSeasonNumberFromTitle('Title 3 Part 2')).seasonNumber, 3);
        });
       test('Season marking with X', async () => {
            assert.strictEqual((await stringHelper.getSeasonNumberFromTitle('Title XX')).seasonNumber, 2, 'Season marking with X');
        });
       test('Season marking with number', async () => {
            assert.strictEqual((await stringHelper.getSeasonNumberFromTitle('Title 2')).seasonNumber, 2, 'Season marking with number');
        });
       test('Season marking with the letter s', async () => {
            assert.strictEqual((await stringHelper.getSeasonNumberFromTitle('Title S2')).seasonNumber, 2, 'Season marking with the letter s');
        });
       test('Season marking with the word season', async () => {
            assert.strictEqual((await stringHelper.getSeasonNumberFromTitle('Title Season 2 - The war')).seasonNumber, 2, 'Season marking with the word season');
        });
       test('Season marking with the a A', async () => {
            assert.strictEqual((await stringHelper.getSeasonNumberFromTitle('Title AA')).seasonNumber, 2, 'Season marking with the a A');
       });
       test('should get season number 2 from title: アルドノア・ゼロ 2', async () => {
            assert.strictEqual((await stringHelper.getSeasonNumberFromTitle('アルドノア・ゼロ 2')).seasonNumber, 'test 2');
        });

    });

    test('should not get a season number from title', async () => {
        await assert.rejects(stringHelper.getSeasonNumberFromTitle('14'), 'number is not a season.');
        await assert.rejects(stringHelper.getSeasonNumberFromTitle('C3'), '2 values cant give a season');
        await assert.rejects(stringHelper.getSeasonNumberFromTitle('C^3'), 'high 3 is not a season number');
        await assert.rejects(stringHelper.getSeasonNumberFromTitle('A Melancolia de Haruhi Suzumiya'));
        await assert.rejects(stringHelper.getSeasonNumberFromTitle('Title'), 'there is no season');
        await assert.rejects(stringHelper.getSeasonNumberFromTitle('Title 2006'), 'a year is not a season');
        await assert.rejects(stringHelper.getSeasonNumberFromTitle('Title AAA'), 'triple a is not a season marker');
        await assert.rejects(stringHelper.getSeasonNumberFromTitle('Title A'), 'single a is not a season marker');
    });

});
