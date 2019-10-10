
import { equal, fail, notStrictEqual, strictEqual } from 'assert';
import MultiProviderResult from '../../src/backend/api/multi-provider-result';
import ListController from '../../src/backend/controller/list-controller';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import { ListProviderLocalData } from '../../src/backend/controller/objects/list-provider-local-data';
import { MediaType } from '../../src/backend/controller/objects/meta/media-type';
import Name from '../../src/backend/controller/objects/meta/name';
import { NameType } from '../../src/backend/controller/objects/meta/name-type';
import Series from '../../src/backend/controller/objects/series';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import { AbsoluteResult } from '../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import MultiProviderComperator from '../../src/backend/helpFunctions/comperators/multi-provider-results-comperator';
import TestProvider from '../controller/objects/testClass/testProvider';

describe('Multi-Provider-Comperator | Examples', () => {
    before(() => {
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => { return []; };
        MainListLoader['saveData'] = async () => { };
        new ListController(true);
    });
    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider('testA'), new TestProvider('testB')];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    });
    it('should compare 2 entrys right', async () => {

        // PART A

        const aSeries = new Series();
        const aProvider = new ListProviderLocalData('testA');
        aProvider.addSeriesName(new Name('Kimetsu no Yaiba: Mugen Ressha-hen', 'x-jap', NameType.OFFICIAL));
        aProvider.addSeriesName(new Name('Demon Slayer: Kimetsu no Yaiba The Movie: Mugen Train', '"unknown"', NameType.MAIN));
        aProvider.addSeriesName(new Name('鬼滅の刃無限列車編', '"jap"', NameType.UNKNOWN));
        aProvider.mediaType = MediaType.MOVIE;
        aProvider.targetSeason = 1;
        aSeries.addProviderDatas(aProvider);

        // PART B

        const bProvider = new ListProviderLocalData('testB');
        bProvider.addSeriesName(new Name('Demon Slayer Movie: InfinityTrain', 'en', NameType.UNKNOWN));
        bProvider.addSeriesName(new Name('kimetsu-no-yaiba-movie-mugen-ressha-hen', 'unknown', NameType.MAIN));
        bProvider.addSeriesName(new Name('劇場版 鬼滅の刃 無限列車編', 'jap', NameType.UNKNOWN));
        bProvider.addSeriesName(new Name('Kimetsu no Yaiba Movie: Mugen Ressha-hen', NameType.UNKNOWN));
        bProvider.mediaType = MediaType.MOVIE;
        bProvider.releaseYear = 1970;

        // TEST

        const result = await MultiProviderComperator.compareMultiProviderWithSeries(aSeries, new MultiProviderResult(bProvider));
        notStrictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_FALSE);
    });


});
