

import { strictEqual } from 'assert';
import providerHelper from '../../../src/backend/helpFunctions/provider/provider-helper';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../../src/backend/controller/objects/meta/name';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import { InfoProviderLocalData } from '../../../src/backend/controller/objects/info-provider-local-data';
import TVMazeProvider from '../../../src/backend/api/tvmaze/tvmaze-provider';

describe('Provider: TVMaze | Test runs', () => {
    const tvmazeProvider = new TVMazeProvider();

    beforeEach(() => {
        ProviderList['loadedListProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = [tvmazeProvider];
    })

    it('should get a series (1/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Sankarea", "en"));
        await series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, tvmazeProvider);
        strictEqual(result.getInfoProvidersInfos().length, 2);
        return;
    })
    it('should get series by id', async () => {
        const unkownProvider = new InfoProviderLocalData();
        unkownProvider.id = 1505;
        const result = await tvmazeProvider.getFullInfoById(unkownProvider)
        strictEqual(result.mainProvider.id, unkownProvider.id);
        return;
    })

});
