
import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';
import MainListPath from '../../../src/backend/controller/main-list-manager/main-list-path';

describe('Main list loader tests', () => {
    beforeEach(() => {
        MainListPath.getPath = (): string => './test/controller/main-list-manager/files/loaded-list.json';
    });

    test('Load save file', () => {
        const series = MainListLoader.loadData();

        expect(series.length).toBe(1);


        for (const serie of series) {
            serie.getAllNames();
        }
    });
});
