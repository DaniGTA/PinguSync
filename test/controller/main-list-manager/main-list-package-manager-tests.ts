import MainListPackageManager from '../../../src/backend/controller/main-list-manager/main-list-package-manager';

import ListController from '../../../src/backend/controller/list-controller';

import TestHelper from '../../test-helper';

import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';

import { strictEqual } from 'assert';
import Series from '../../../src/backend/controller/objects/series';
import TestProvider from '../objects/testClass/testProvider';



describe('MainListPackageManager', () => {
    const lc = new ListController(true);

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('Test2')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should return a list of packages (length: 1)', async () => {
        const list: Series[] = [];

        const series = new Series();

        list.push(series);

        const seriesList = Object.freeze(list);
        const seriesPackage = await new MainListPackageManager().getSeriesPackages(seriesList);

        strictEqual(seriesPackage.length, 1);
    });
});
