import { strictEqual } from 'assert';
import ListController from '../../src/backend/controller/list-controller';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import { ListProviderLocalData } from '../../src/backend/controller/objects/list-provider-local-data';
import { MediaType } from '../../src/backend/controller/objects/meta/media-type';
import Name from '../../src/backend/controller/objects/meta/name';
import Series from '../../src/backend/controller/objects/series';
import { SeasonError } from '../../src/backend/controller/objects/transfer/season-error';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import seasonHelper from '../../src/backend/helpFunctions/season-helper/season-helper';
import { SeasonSearchMode } from '../../src/backend/helpFunctions/season-helper/season-search-mode';
import TestProvider from '../controller/objects/testClass/testProvider';

describe('Season Helper', () => {

    const lc = new ListController(true);

    before(() => {
        // tslint:disable-next-line: no-string-literal
        MainListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-string-literal
        MainListLoader['loadData'] = () => [];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };
    });
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('test', true, false), new TestProvider('test2', true, true)];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
    });

    it('should get the right season value: 1', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData('test2');
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.prequelIds.push(2);
        listProvider.addSeriesName(new Name('Test', 'x-jap'));
        a.addListProvider(listProvider);

        const b = new Series();
        const listProvider2 = new ListProviderLocalData('test2');
        listProvider2.id = 2;
        listProvider2.mediaType = MediaType.SPECIAL;
        listProvider2.addSeriesName(new Name('Test', 'x-jap'));
        b.addListProvider(listProvider2);
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [a, b];
        const result = await seasonHelper.searchSeasonValue(a, SeasonSearchMode.ALL);
        strictEqual(result.season, 1);
    });

    it('should get the right season value: 2', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData('test2');
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.prequelIds.push(2);
        listProvider.addSeriesName(new Name('Test', 'x-jap'));
        a.addListProvider(listProvider);

        const b = new Series();
        const listProvider2 = new ListProviderLocalData('test2');
        listProvider2.id = 2;
        listProvider2.mediaType = MediaType.ANIME;
        listProvider2.addSeriesName(new Name('Test 1', 'x-jap'));
        b.addListProvider(listProvider2);
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [a, b];
        const result = await seasonHelper.searchSeasonValue(a, SeasonSearchMode.ALL);
        strictEqual(result.season, 2);
    });

    it('should get the right season value: 3', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData('test2');
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.prequelIds.push(2);
        listProvider.addSeriesName(new Name('Test', 'x-jap'));
        a.addListProvider(listProvider);

        const b = new Series();
        const listProvider2 = new ListProviderLocalData('test2');
        listProvider2.id = 2;
        listProvider2.prequelIds.push(3);
        listProvider2.mediaType = MediaType.ANIME;
        listProvider2.addSeriesName(new Name('TestTwo', 'x-jap'));
        b.addListProvider(listProvider2);

        const c = new Series();
        const listProvider3 = new ListProviderLocalData('test2');
        listProvider3.id = 3;
        listProvider3.mediaType = MediaType.ANIME;
        listProvider3.addSeriesName(new Name('Test 1', 'x-jap'));
        c.addListProvider(listProvider3);
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [a, b, c];
        const result = await seasonHelper.searchSeasonValue(a, SeasonSearchMode.ALL);
        strictEqual(result.season, 3);
    });

    it('should get the right season value: 4', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData('test2');
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.sequelIds.push(2);
        listProvider.addSeriesName(new Name('Test', 'x-jap'));
        a.addListProvider(listProvider);

        const b = new Series();
        const listProvider2 = new ListProviderLocalData('test2');
        listProvider2.id = 2;
        listProvider2.sequelIds.push(3);
        listProvider2.mediaType = MediaType.ANIME;
        listProvider2.addSeriesName(new Name('TestTwo', 'x-jap'));
        b.addListProvider(listProvider2);

        const c = new Series();
        const listProvider3 = new ListProviderLocalData('test2');
        listProvider3.id = 3;
        listProvider3.mediaType = MediaType.ANIME;
        listProvider3.addSeriesName(new Name('Test 6', 'x-jap'));
        c.addListProvider(listProvider3);
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [a, b, c];
        const result = await seasonHelper.searchSeasonValue(a, SeasonSearchMode.ALL);
        strictEqual(result.season, 4);
    });

    it('should get the right season value: 5', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData('test2');
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.sequelIds.push(2);
        listProvider.addSeriesName(new Name('Test', 'x-jap'));
        a.addListProvider(listProvider);

        const b = new Series();
        const listProvider2 = new ListProviderLocalData('test2');
        listProvider2.id = 2;
        listProvider2.sequelIds.push(3);
        listProvider2.mediaType = MediaType.ANIME;
        listProvider2.addSeriesName(new Name('Test 6', 'x-jap'));
        b.addListProvider(listProvider2);
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [a, b];
        const result = await seasonHelper.searchSeasonValue(a, SeasonSearchMode.ALL);
        strictEqual(result.season, 5);
    });

    it('should get none seasons', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData('test2');
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.addSeriesName(new Name('Test', 'x-jap'));
        a.addListProvider(listProvider);
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [a];
        const result = await seasonHelper.searchSeasonValue(a, SeasonSearchMode.ALL);
        strictEqual(result.seasonError, SeasonError.CANT_GET_SEASON);
    });
});
