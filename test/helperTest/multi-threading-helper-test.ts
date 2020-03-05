import { strictEqual } from 'assert';
import MultiThreadingHelper from '../../src/backend/helpFunctions/multi-threading-helper';
import stringHelper from '../../src/backend/helpFunctions/string-helper';


describe('Multithreading | Testrun', () => {
    beforeEach(() => {
    });
    test('test delegate function', async () => {

        const testAsyncFunction = async (x: number, y: number) => stringHelper.getSeasonNumberFromTitle('test 2');
        const result = await MultiThreadingHelper.runFunctionInWorker(testAsyncFunction, 1, 1);
        strictEqual(result.seasonNumber, 2);
    });
});
