import MultiThreadingHelper from '../../src/backend/helpFunctions/multi-threading-helper';
import stringHelper from '../../src/backend/helpFunctions/string-helper';


describe('Multithreading | Testrun', () => {
    test('test delegate function', async () => {

        const testAsyncFunction = async (x: number, y: number) => stringHelper.getSeasonNumberFromTitle('test 2');
        const result = await MultiThreadingHelper.runFunctionInWorker(testAsyncFunction, 1, 1);
        expect(result.seasonNumber).toEqual(2);
    });
});
