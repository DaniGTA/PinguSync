import * as assert from 'assert';
import titleCheckHelper from '../../src/backend/helpFunctions/titleCheckHelper';
describe('TitleCheckerTest', () => {
    it('should match (fastMatch)', async () => {
        assert.equal(await titleCheckHelper.fastMatch(["Abc"], ["abcdefg", "ABCD"]), true)
        assert.equal(await titleCheckHelper.fastMatch(["Title Season 2"], ["title s2"]), true)
        assert.equal(await titleCheckHelper.fastMatch(["Title Title Season 2"], ["title title II"]), true)
        assert.equal(await titleCheckHelper.fastMatch(["ATitle"], ["BTitle"]), false)
        assert.equal(await titleCheckHelper.fastMatch(["Title ABC"], ["Title CBA"]), true)
        return;
    });
    it('should remove season from title', async () => {
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle("Title Season 2"), "Title")
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle("Title III"), "Title")
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle("Title Episode 2"), "Title Episode 2")
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle("Title 2"), "Title")
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle("Title 2nd -Test-"), "Title -Test-")
        return;
    });
});