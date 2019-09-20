import * as assert from 'assert';
import Name from '../../../src/backend/controller/objects/meta/name';
import stringHelper from '../../../src/backend/helpFunctions/string-helper';

describe('namesTest', () => {
    it('should detect kanji', async () => {
        assert.equal(await stringHelper.hasKanji('テスト'), true);
        assert.equal(await stringHelper.hasKanji('test'), false);
        return;
    });
    it('should extract season number from title', async () => {
       
        assert.equal(await stringHelper.getSeasonNumberFromTitle('Title 2'), 2, 'Title 2');
        assert.equal(await stringHelper.getSeasonNumberFromTitle('Title II'), 2, 'Title II');
        assert.equal(await stringHelper.getSeasonNumberFromTitle('Title III'), 3, 'Title III');
        assert.equal(await stringHelper.getSeasonNumberFromTitle('Title 2nd Season'), 2, 'Title 2nd Season');
        assert.equal(await stringHelper.getSeasonNumberFromTitle('Title 3nd Season -Test-'), 3, 'Title 3nd Season -Test-');
        assert.equal(await stringHelper.getSeasonNumberFromTitle('Title Season 2 -Test-'), 2, 'Title Season 2 -Test-');
        try {
            await stringHelper.getSeasonNumberFromTitle('Gintama.: Shirogane no Tamashii-hen - Kouhan-sen');
            assert.fail();
        } catch (err) { }
        try {
            await stringHelper.getSeasonNumberFromTitle('Gintama.: Silver Soul Arc - Second Half War');
            assert.fail();
        } catch (err) { }
        try {
            await stringHelper.getSeasonNumberFromTitle('銀魂. 銀ノ魂篇2');
            assert.fail();
        }catch(err){}
        return;
    })
    it('should detect no romaji name', async () => {
        const names = [];
         names.push(new Name('テスト','jap'));
        try {
            await Name.getRomajiName(names);
            assert.equal(false, true);
        } catch (err) {
            assert.equal(true, true);
        }
        return;
    });

    it('should return romaji name', async () => {
        const names = [];
        names.push(new Name('テスト','jap'));
        names.push(new Name('test','en'));
        assert.equal(await Name.getRomajiName(names), 'test');
        return;
    });

    it('should not sort out', async () => {
        let names:Name[] = [];
        names.push(new Name('A Viagem de Chihiro','en'));
        names.push(new Name('Avanture male Chihiro','en'));
        names.push(new Name('Cesta do fantazie','en'));
        names.push(new Name('Cesta do fantázie','en'));
        names.push(new Name('Chihiro Og Heksene','en'));
        names.push(new Name('Chihiro Szellemországban','en'));
        names.push(new Name('Chihiros Reise ins Zauberland','en'));
        names.push(new Name('De reis van Chihiro','en'));
        names.push(new Name('El Viaje de Chihiro','en'));
        names.push(new Name('Henkien kätkemä','en'));
        names.push(new Name('La Città Incantata','en'));
        names.push(new Name('Le voyage de Chihiro','en'));
        names.push(new Name('SA','en'));
        names.push(new Name('Sen and Chihiro`s Spiriting Away','en'));
        names.push(new Name('Sen and Chihiros Spiriting Away','en'));
        names.push(new Name('Sen to Chihiro','en'));
        names.push(new Name('Sen to Chihiro no Kamikakushi','en'));
        names.push(new Name('Spirited Away', 'en'));
        names.push(new Name('Spirited Away', 'en'));
        names.push(new Name('Spirited Away','en'));
        names.push(new Name('Spirited Away: W krainie bogów','en'));
        names.push(new Name('Stebuklingi Šihiros nuotykiai Dvasių pasaulyje','en'));
        names.push(new Name('Vaimudest viidud','en'));
        names.push(new Name('Čudežno potovanje', 'en'));
        names = names.sort((a, b) => Name.getSearchAbleScore(b,names) - Name.getSearchAbleScore(a,names)).slice(0, 9);
        const result = names.findIndex(x => x.name === "Spirited Away");
        assert.notStrictEqual(result, -1);
    })
});
