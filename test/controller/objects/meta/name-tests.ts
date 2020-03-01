import { strictEqual } from 'assert';
import Name from '../../../../src/backend/controller/objects/meta/name';
import { NameType } from '../../../../src/backend/controller/objects/meta/name-type';
import TestHelper from '../../../test-helper';

describe('Season object tests', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });

    test('should get season number out of name list', async () => {
        const name = new Name('Test 2', 'en', NameType.MAIN);
        strictEqual((await Name.getSeasonNumber([name])).seasonNumber, 2);
    });

    test('should get only Romaji names', async () => {
        const name = new Name('Test 2', 'en', NameType.MAIN);
        const name2 = new Name('この素晴らしい世界に祝福を 2 ', 'jap', NameType.MAIN);
        const result = await Name.getRomajiName([name, name2]);
        strictEqual(result, name.name);
    });
});
