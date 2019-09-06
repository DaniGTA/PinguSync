

import { strictEqual } from 'assert';
import providerHelper from '../../../src/backend/helpFunctions/provider/provider-helper';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../../src/backend/controller/objects/meta/name';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import OMDbProvider from '../../../src/backend/api/omdb/omdb-provider';
import { InfoProviderLocalData } from '../../../src/backend/controller/objects/info-provider-local-data';

describe('OMDb Tests', () => {
    const omdbProvider = new OMDbProvider();

    beforeEach(() => {
        ProviderList['loadedListProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = [omdbProvider];
    })

    it('should get a series (1/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Sankarea: Undying Love", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, omdbProvider);
        strictEqual(result.getInfoProvidersInfos().length, 1);
        return;
    })
    it('should get series by id', async () => {
        const unkownProvider = new InfoProviderLocalData();
        unkownProvider.id = "tt2341379";
        const result = await omdbProvider.getFullInfoById(unkownProvider)
        strictEqual(result.mainProvider.id, unkownProvider.id);
        return;
    })

});
