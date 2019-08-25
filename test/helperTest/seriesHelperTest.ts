import Series from "../../src/backend/controller/objects/series";
import seriesHelper from '../../src/backend/helpFunctions/series-helper';
import { strictEqual } from 'assert';

describe('seriesHelperTest', () => {
    it('should not detect as same series', async () => {
        var a = new Series();
        var b = new Series();

        strictEqual(await seriesHelper.isSameSeries(a, b), false);
    });
});