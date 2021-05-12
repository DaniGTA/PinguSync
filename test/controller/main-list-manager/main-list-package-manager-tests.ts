import MainListPackageManager from '../../../src/backend/controller/main-list-manager/main-list-package-manager';
import Series from '../../../src/backend/controller/objects/series';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import TestListProvider from '../objects/testClass/testListProvider';
import TestListProvider2 from '../objects/testClass/testListProvider2';



describe('MainListPackageManager', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider(), new TestListProvider2()];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should return a list of packages (length: 1)', async () => {
        const list: Series[] = [];

        const series = new Series();

        list.push(series);

        const seriesList = Object.freeze(list);
        const seriesPackage = await MainListPackageManager.getSeriesPackages(seriesList);

        expect(seriesPackage.length).toBe(1);
    });
});
