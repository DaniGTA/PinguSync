

import { strictEqual } from 'assert';
import providerHelper from '../../../src/backend/helpFunctions/provider/provider-helper';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../../src/backend/controller/objects/meta/name';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import OMDbProvider from '../../../src/backend/api/omdb/omdb-provider';

describe('OMDb Tests', () => {
    const omdbProvider = new OMDbProvider();

    beforeEach(() => {
        ProviderList['loadedListProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = undefined;
    })

    it('should get a series (1/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Sankarea", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, omdbProvider);
        strictEqual(result.getListProvidersInfos().length, 2);
    })

});
