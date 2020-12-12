import StringHelper from '../../src/backend/helpFunctions/string-helper';

describe('String Helper', () => {
    test('should generate a randome string', () => {
        expect(StringHelper.randomString()).not.toEqual('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
        expect(StringHelper.randomString()).not.toEqual('');
        expect(typeof StringHelper.randomString()).not.toEqual('undefined');
        expect(StringHelper.randomString()).not.toEqual(null);
        return;
    });
    describe('should clean string', () => {
        test('should clean string: Title ~Title!~', () => {
            expect(StringHelper.cleanString('Title ~Title!~')).toEqual('Title Title');
        });
        test('should clean string: Test.', () => {
            expect(StringHelper.cleanString('Test.')).toEqual('Test');
        });
        test('should clean string: Title -test-', () => {
            expect(StringHelper.cleanString('Title -test-')).toEqual('Title test');
        });
        test('should clean string: Title-test', () => {
            expect(StringHelper.cleanString('Title-test')).toEqual('Title test');
        });
        test('should clean string: Title \'test\'', () => {
            expect(StringHelper.cleanString('Title \'test\'')).toEqual('Title test');
        });
        test('should clean string: Title!!', () => {
            expect(StringHelper.cleanString('Title!!')).toEqual('Title!!');
        });
        test('should clean string: Title: test', () => {
            expect(StringHelper.cleanString('Title: test')).toEqual('Title test');
        });
        test('should clean string: Title  test', () => {
            expect(StringHelper.cleanString('Title  test')).toEqual('Title test');
        });
        test('should clean string: Title`Title`', () => {
            expect(StringHelper.cleanString('Title`Title`')).toEqual('TitleTitle');
        });
    });

    test('should clean string of other characters', () => {
        expect(StringHelper.cleanString('この素晴らしい世界に祝福を！紅伝説')).toEqual('この素晴らしい世界に祝福を 紅伝説');
        expect(StringHelper.cleanString('この素晴らしい世界に祝福を! 紅伝説')).toEqual('この素晴らしい世界に祝福を 紅伝説');
    });
    test('should not crash on check kanij', () => {
        expect(StringHelper.hasKanji(null as unknown as string)).toBe(false);
    });

    test('should detect cryillic', () => {
        expect(StringHelper.hasCyrillic('Привіт')).toBe(true);
        return;
    });

    test('should not detect cryillic', () => {
        expect(StringHelper.hasCyrillic('Hello')).toBe(false);
        return;
    });

    test('should detect hangul letters', () => {
        expect(StringHelper.hasHangul('안녕')).toBe(true);
        return;
    });

    test('should not detect hangul letters', () => {
        expect(StringHelper.hasHangul('Hello')).toBe(false);
        return;
    });

    test('should make test to tset', () => {
        const result = StringHelper.reverseString('test');
        expect(result).toEqual('tset');
        return;
    });

    describe('should detect basic latin', () => {
        test('should detect basic latin letters', () => {
            expect(StringHelper.isOnlyBasicLatin('Test: - 2')).toBe(true);
            expect(StringHelper.isOnlyBasicLatin('Test/test! - 2 (1990)')).toBe(true);
            return;
        });
        test('should detect that is it no basic latin letters', () => {
            expect(StringHelper.isOnlyBasicLatin('この素晴らしい世界に祝福を! 紅伝説')).toBe(false);
            expect(StringHelper.isOnlyBasicLatin('Test: Привіт - 2')).toBe(false);
            expect(StringHelper.isOnlyBasicLatin('Test/test! - 2 (1990) 안녕')).toBe(false);
            return;
        });
    });

    describe('should get right season number from title', () => {
        test('should detect parts', () => {
            expect((StringHelper.getSeasonNumberFromTitle('Title 3 Part 2')).seasonNumber).toEqual(3);
        });
        test('Season marking with X', () => {
            expect((StringHelper.getSeasonNumberFromTitle('Title XX')).seasonNumber).toEqual(2);
        });
        test('Season marking with number', () => {
            expect((StringHelper.getSeasonNumberFromTitle('Title 2')).seasonNumber).toEqual(2);
        });
        test('Season marking with the letter s', () => {
            expect((StringHelper.getSeasonNumberFromTitle('Title S2')).seasonNumber).toEqual(2);
        });
        test('Season marking with the word season', () => {
            expect((StringHelper.getSeasonNumberFromTitle('Title Season 2 - The war')).seasonNumber).toEqual(2);
        });
        test('Season marking with the a A', () => {
            expect((StringHelper.getSeasonNumberFromTitle('Title AA')).seasonNumber).toEqual(2);
        });
        test('should get season number 2 from title: アルドノア・ゼロ 2', () => {
            expect((StringHelper.getSeasonNumberFromTitle('アルドノア・ゼロ 2')).seasonNumber).toEqual(2);
        });
    });

    test('should not get a season number from title', () => {
        expect(() => StringHelper.getSeasonNumberFromTitle('14')).toThrow();
        expect(() => StringHelper.getSeasonNumberFromTitle('C3')).toThrow();
        expect(() => StringHelper.getSeasonNumberFromTitle('C^3')).toThrow();
        expect(() => StringHelper.getSeasonNumberFromTitle('A Melancolia de Haruhi Suzumiya')).toThrow();
        expect(() => StringHelper.getSeasonNumberFromTitle('Title')).toThrow();
        expect(() => StringHelper.getSeasonNumberFromTitle('Title 2006')).toThrow();
        expect(() => StringHelper.getSeasonNumberFromTitle('Title AAA')).toThrow();
        expect(() => StringHelper.getSeasonNumberFromTitle('Title A')).toThrow();
    });

});
