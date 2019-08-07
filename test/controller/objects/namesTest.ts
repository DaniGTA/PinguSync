import * as assert from 'assert';
import Name from '../../../src/backend/controller/objects/meta/name';
import stringHelper from '../../../src/backend/helpFunctions/stringHelper';

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
});
