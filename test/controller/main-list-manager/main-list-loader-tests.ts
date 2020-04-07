import { strictEqual } from 'assert';
import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';
import MainListPath from '../../../src/backend/controller/main-list-manager/main-list-path';

describe('Main list loader tests', () => {
    beforeEach(() => {
        MainListPath.getPath = () => './test/controller/main-list-manager/files/loaded-list.json';
    });

    test('Load save file', async () => {
        const series = MainListLoader.loadData();

        strictEqual(series.length, 1);


        for (const serie of series) {
            serie.getAllNames();
        }
    });
});
