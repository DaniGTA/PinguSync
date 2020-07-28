import Cover from '../../../src/backend/controller/objects/meta/cover';
import CoverHelper from '../../../src/backend/helpFunctions/cover-helper/cover-helper';

describe('Cover Helper Test', () => {
    test('It should return unique list (two list)', () => {
        const failedA = new Cover('test2');
        failedA.failed = true;
        const failedB = new Cover('test2');
        const coverListA: Cover[] = [new Cover('test'), failedA, new Cover('test3')];
        const coverListB: Cover[] = [new Cover('test'), failedB];
        const result = CoverHelper.getUniqueCoverList(coverListA, coverListB);
        expect(result.length).toBe(3);
        const failedC = result.find(x => x.url === 'test2');
        expect(failedC?.failed).toBeTruthy();
    });

    test('It should return unique list (one list)', async () => {
        const failedA = new Cover('test2');
        failedA.failed = true;
        const failedB = new Cover('test2');
        const coverListA: Cover[] = [new Cover('test'), failedA, new Cover('test3'), new Cover('test'), failedB];
        const result = CoverHelper.getUniqueCoverList(coverListA);
        expect(result.length).toBe(3);
        const failedC = result.find(x => x.url === 'test2');
        expect(failedC?.failed).toBeTruthy();
    });
});
