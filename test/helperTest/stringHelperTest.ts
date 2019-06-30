import * as assert from 'assert';
import stringHelper from '../../src/backend/helpFunctions/stringHelper';
describe('stringHelperTest', () => {
    it('should clean string', async () => {
        assert.equal(await stringHelper.cleanString("Test."), "Test");
        assert.equal(await stringHelper.cleanString("Title -test-"), "Title test");
        assert.equal(await stringHelper.cleanString("Title-test"), "Title test");
        assert.equal(await stringHelper.cleanString("Title 'test'"), "Title test");
        assert.equal(await stringHelper.cleanString("Title!"), "Title");
        assert.equal(await stringHelper.cleanString("Title!!"), "Title!!");
        assert.equal(await stringHelper.cleanString("Title: test"), "Title test");
        assert.equal(await stringHelper.cleanString("Title  test"), "Title test");
        return;
    });
    it('should make test to tset'), async () => {
        assert.equal(await stringHelper.reverseString('test'), 'tset');
        return;
    }
});