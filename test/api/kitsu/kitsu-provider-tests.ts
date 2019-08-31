

import { strictEqual } from 'assert';
import providerHelper from '../../../src/backend/helpFunctions/provider/provider-helper';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../../src/backend/controller/objects/meta/name';
import KitsuProvider from '../../../src/backend/api/kitsu/kitsu-provider';

describe('Kitsu Tests', () => {
    const kitsuProvider = new KitsuProvider();
    it('should get a series (1/2)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Sankarea", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getListProvidersInfos().length, 2);
    })

    it('should get a series (2/2)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Seitokai Yakuindomo＊", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getListProvidersInfos().length, 2);
    })

});
