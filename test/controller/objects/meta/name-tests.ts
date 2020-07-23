import Name from '../../../../src/backend/controller/objects/meta/name';
import { NameType } from '../../../../src/backend/controller/objects/meta/name-type';


describe('Season object tests', () => {
    test('should get season number out of name list', () => {
        const name = new Name('Test 2', 'en', NameType.MAIN);
        expect((Name.getSeasonNumber([name])).seasonNumber).toBe(2);
    });

    test('should get season number out of short', () => {
        const name = new Name('short2', 'en', NameType.SHORT);
        expect((Name.getSeasonNumber([name])).seasonNumber).toBe(2);
    });

    test('should get only Romaji names', () => {
        const name = new Name('Test 2', 'en', NameType.MAIN);
        const name2 = new Name('この素晴らしい世界に祝福を 2 ', 'jap', NameType.MAIN);
        const result = Name.getRomajiName([name, name2]);
        expect(result).toBe(name.name);
    });
});
