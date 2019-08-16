import * as assert from 'assert';
import titleCheckHelper from '../../src/backend/helpFunctions/title-check-helper';
describe('TitleCheckerTest', () => {
    it('should match (fastMatch)', async () => {
        assert.equal(await titleCheckHelper.fastMatch(["Abc"], ["abcdefg", "ABCD"]), true)
        assert.equal(await titleCheckHelper.fastMatch(["Title Season 2"], ["title s2"]), true)
        assert.equal(await titleCheckHelper.fastMatch(["Title Title Season 2"], ["title title II"]), true)
        assert.equal(await titleCheckHelper.fastMatch(["ATitle"], ["BTitle"]), false)
        assert.equal(await titleCheckHelper.fastMatch(["Title ABC"], ["Title CBA"]), true)
        assert.equal(await titleCheckHelper.fastMatch(["Test"], ["Test III"]), true)
        return;
    });

    it('should match (skipFastMatch)', async () => {
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title"], ["ATitle", "title"]), true)
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title"], ["ATitle", "Title"]), true)
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title!"], ["ATitle", "title"]), true)
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title!?"], ["ATitle", "title"]), true)
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title Season 3"], ["ATitle", "Title"]), true)
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title! Season 3"], ["ATitle", "Title"]), true)
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title Season 3"], ["ATitle", "title"]), true)
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title Season 3"], ["ATitle", "Ctitle"]), false)
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(["Title!"], ["ATitle", "titleG"]), false)
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
