import * as assert from 'assert';
import stringHelper from '../../src/backend/helpFunctions/string-helper';
describe('stringHelperTest', () => {
    it('should generate a randome string', async () => {
        assert.notEqual(stringHelper.randomString(), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
        assert.notEqual(stringHelper.randomString(), '');
        assert.notEqual(typeof stringHelper.randomString(), 'undefined');
        assert.notEqual(stringHelper.randomString(), null);
        return;
    });
    it('should clean string', async () => {
        assert.strictEqual(await stringHelper.cleanString("Test."), "Test");
        assert.strictEqual(await stringHelper.cleanString("Title -test-"), "Title test");
        assert.strictEqual(await stringHelper.cleanString("Title-test"), "Title test");
        assert.strictEqual(await stringHelper.cleanString("Title 'test'"), "Title test");
        assert.strictEqual(await stringHelper.cleanString("Title!"), "Title");
        assert.strictEqual(await stringHelper.cleanString("Title!!"), "Title!!");
        assert.strictEqual(await stringHelper.cleanString("Title: test"), "Title test");
        assert.strictEqual(await stringHelper.cleanString("Title  test"), "Title test");
        return;
    });
    it('should not crash on check kanij', async () => {
        assert.strictEqual(await stringHelper.hasKanji(null as unknown as string), false);
    });

    it('should detect cryillic', async () => {
        assert.strictEqual(await stringHelper.hasCyrillic('Привіт'), true);
        return;
    })

    it('should not detect cryillic', async () => {
        assert.strictEqual(await stringHelper.hasCyrillic('Hello'), false);
        return;
    })

    it('should detect hangul letters', async () => {
        assert.strictEqual(await stringHelper.hasHangul('안녕'), true);
        return;
    })

    it('should not detect hangul letters', async () => {
        assert.strictEqual(await stringHelper.hasHangul('Hello'), false);
        return;
    })

    it('should make test to tset', async () => {
        const result = await stringHelper.reverseString('test');
        assert.equal(result, 'tset');
        return;
    });


});
