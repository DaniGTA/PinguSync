

import { strictEqual } from 'assert';
import TVMazeProvider from '../../../src/backend/api/tvmaze/tvmaze-provider';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerHelper from '../../../src/backend/helpFunctions/provider/provider-helper';

// tslint:disable: no-string-literal
describe('Provider: TVMaze | Test runs', () => {
    const tvmazeProvider = new TVMazeProvider();

    beforeEach(() => {
        ProviderList['loadedListProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = [tvmazeProvider];
    });

    it('should get a series (1/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1, '');
        unkownProvider.addSeriesName(new Name('Sankarea', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, tvmazeProvider);
        strictEqual(result.getInfoProvidersInfos().length, 2);
        return;
    });
    it('should get series by id', async () => {
        const unkownProvider = new InfoProviderLocalData(1505, '');
        const result = await tvmazeProvider.getFullInfoById(unkownProvider);
        strictEqual(result.mainProvider.id, unkownProvider.id);
        return;
    });

});
