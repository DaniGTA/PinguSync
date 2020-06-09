import Name from '../../../src/backend/controller/objects/meta/name';
import stringHelper from '../../../src/backend/helpFunctions/string-helper';

describe('Name | Season + lang detection', () => {
    test('should detect kanji', () => {
        expect(stringHelper.hasKanji('テスト')).toBeTruthy();
        expect(stringHelper.hasKanji('test')).toBeFalsy();
    });

    test('should extract season number from title', () => {
        expect((stringHelper.getSeasonNumberFromTitle('Title 2')).seasonNumber).toBe(2);
        expect((stringHelper.getSeasonNumberFromTitle('Title III')).seasonNumber).toBe(3);
        expect((stringHelper.getSeasonNumberFromTitle('Title 2nd Season')).seasonNumber).toBe(2);
        expect((stringHelper.getSeasonNumberFromTitle('Title II')).seasonNumber).toBe(2);
        expect((stringHelper.getSeasonNumberFromTitle('Title 3nd Season -Test-')).seasonNumber).toBe(3);
        expect((stringHelper.getSeasonNumberFromTitle('Title Season 2 -Test-')).seasonNumber).toBe(2);
    });

    test('should throw on extracting season number', () => {
        expect(() => stringHelper.getSeasonNumberFromTitle('Gintama.: Shirogane no Tamashii-hen - Kouhan-sen')).toThrow();
        expect(() => stringHelper.getSeasonNumberFromTitle('Gintama.: Silver Soul Arc - Second Half War')).toThrow();
        //expect(() => stringHelper.getSeasonNumberFromTitle('銀魂. 銀ノ魂篇2')).toThrow();
    });

    test('should detect no romaji name', () => {
        const names: Name[] = [];
        names.push(new Name('テスト', 'jap'));
        expect(() => Name.getRomajiName(names)).toThrow();
    });

    test('should return romaji name', () => {
        const names = [];
        names.push(new Name('テスト', 'jap'));
        names.push(new Name('test', 'en'));
        expect(Name.getRomajiName(names)).toBe('test');
        return;
    });

    test('should not sort out', () => {
        let names: Name[] = [];
        names.push(new Name('A Viagem de Chihiro', 'en'));
        names.push(new Name('Avanture male Chihiro', 'en'));
        names.push(new Name('Cesta do fantazie', 'en'));
        names.push(new Name('Cesta do fantázie', 'en'));
        names.push(new Name('Chihiro Og Heksene', 'en'));
        names.push(new Name('Chihiro Szellemországban', 'en'));
        names.push(new Name('Chihiros Reise ins Zauberland', 'en'));
        names.push(new Name('De reis van Chihiro', 'en'));
        names.push(new Name('El Viaje de Chihiro', 'en'));
        names.push(new Name('Henkien kätkemä', 'en'));
        names.push(new Name('La Città Incantata', 'en'));
        names.push(new Name('Le voyage de Chihiro', 'en'));
        names.push(new Name('SA', 'en'));
        names.push(new Name('Sen and Chihiro`s Spiriting Away', 'en'));
        names.push(new Name('Sen and Chihiros Spiriting Away', 'en'));
        names.push(new Name('Sen to Chihiro', 'en'));
        names.push(new Name('Sen to Chihiro no Kamikakushi', 'en'));
        names.push(new Name('Spirited Away', 'en'));
        names.push(new Name('Spirited Away', 'en'));
        names.push(new Name('Spirited Away', 'en'));
        names.push(new Name('Spirited Away: W krainie bogów', 'en'));
        names.push(new Name('Stebuklingi Šihiros nuotykiai Dvasių pasaulyje', 'en'));
        names.push(new Name('Vaimudest viidud', 'en'));
        names.push(new Name('Čudežno potovanje', 'en'));
        names = names.sort((a, b) => Name.getSearchAbleScore(b, names) - Name.getSearchAbleScore(a, names)).slice(0, 9);
        const result = names.findIndex((x) => x.name === 'Spirited Away');
        expect(result).not.toBe(-1);
    });
});
