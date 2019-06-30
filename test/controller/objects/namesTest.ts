import * as assert from 'assert';
import Names from '../../../src/backend/controller/objects/names';

describe('namesTest', () => {
    it('should detect kanji', async () => {
        const names = new Names();
        assert.equal(await names.InternalTesting().hasKanji('テスト'), true);
        assert.equal(await names.InternalTesting().hasKanji('test'), false);
        return;
    });
    it('should extract season number from title', async () => {
        const names = new Names();
        assert.equal(await names.InternalTesting().getSeasonNumberFromTitle('Title 2'), 2, 'Title 2');
        assert.equal(await names.InternalTesting().getSeasonNumberFromTitle('Title II'), 2, 'Title II');
        assert.equal(await names.InternalTesting().getSeasonNumberFromTitle('Title III'), 3, 'Title III');
        assert.equal(await names.InternalTesting().getSeasonNumberFromTitle('Title 2nd Season'), 2, 'Title 2nd Season');
        assert.equal(await names.InternalTesting().getSeasonNumberFromTitle('Title 3nd Season -Test-'), 3, 'Title 3nd Season -Test-');
        assert.equal(await names.InternalTesting().getSeasonNumberFromTitle('Title Season 2 -Test-'), 2, 'Title Season 2 -Test-');
        return;
    })
    it('should detect no romaji name', async () => {
        const names = new Names();
        names.mainName = 'テスト';
        try {
            await names.getRomajiName();
            assert.equal(false, true);
        } catch (err) {
            assert.equal(true, true);
        }
        return;
    });

    it('should return romaji name', async () => {
        const names = new Names();
        names.mainName = 'テスト';
        names.romajiName = 'test';
        assert.equal(await names.getRomajiName(), 'test');
        return;
    });

    it('should return all names', async () => {
        const names = new Names();
        names.mainName = 'テスト';
        names.romajiName = 'test';
        names.shortName = '';
        assert.equal((await names.getAllNames()).length, 2);
        return;
    });
});