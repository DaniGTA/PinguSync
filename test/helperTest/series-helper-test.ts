import { strictEqual } from 'assert';
import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import { MediaType } from '../../src/backend/controller/objects/meta/media-type';
import Name from '../../src/backend/controller/objects/meta/name';
import { NameType } from '../../src/backend/controller/objects/meta/name-type';
import Season from '../../src/backend/controller/objects/meta/season';
import Series from '../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderDataWithSeasonInfo from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import seriesHelper from '../../src/backend/helpFunctions/series-helper';
import TestProvider from '../controller/objects/testClass/testProvider';



describe('Series Helper', () => {
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
    test('should not detect as same series', async () => {
        const a = new Series();
        // tslint:disable-next-line: no-string-literal
        a['cachedSeason'] = new Season([2]);
        // tslint:disable-next-line: no-string-literal
        a['canSync'] = false;
        // A is should not match with any of them.
        const infoProviderA = new InfoProviderLocalData('14792', 'test3');
        await a.addInfoProvider(infoProviderA);
        const listProviderA = new ListProviderLocalData(108632, 'test2');
        listProviderA.infoStatus = ProviderInfoStatus.FULL_INFO;
        listProviderA.prequelIds.push(21355);
        listProviderA.isNSFW = false;
        listProviderA.addSeriesName(new Name('Test 2', 'x-jap'));
        await a.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(listProviderA, new Season([2])));
        // B is related too C
        const b = new Series();
        // tslint:disable-next-line: no-string-literal
        b['cachedSeason'] = new Season([1]);
        // tslint:disable-next-line: no-string-literal
        b['canSync'] = false;
        const infoProviderB = new InfoProviderLocalData(260449, 'test4');
        infoProviderB.infoStatus = ProviderInfoStatus.FULL_INFO;
        await b.addInfoProvider(infoProviderB);
        const listProvider = new ListProviderLocalData(43973, 'test');
        listProvider.infoStatus = ProviderInfoStatus.FULL_INFO;
        listProvider.releaseYear = 2013;
        listProvider.isNSFW = false;
        listProvider.addSeriesName(new Name('Other Series', 'x-jap'));
        await b.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(listProvider, new Season([1])));

        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [a, b];

        const c = new Series();
        // tslint:disable-next-line: no-string-literal
        c['cachedSeason'] = new Season([2]);
        // tslint:disable-next-line: no-string-literal
        c['canSync'] = false;
        const listProviderB = new ListProviderLocalData(43973, 'test');
        listProviderB.isNSFW = false;
        listProviderB.infoStatus = ProviderInfoStatus.FULL_INFO;
        listProviderB.addSeriesName(new Name('Series Test', 'x-jap'));
        await c.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(listProviderB, new Season([2])));

        strictEqual(await seriesHelper.isSameSeries(a, c), false);
    });

    test('should not detect as same series (corruptdata)', async () => {
        const seriesA = await fullseriesA();
        const seriesB = await fullseriesB();

        strictEqual(await seriesHelper.isSameSeries(seriesA, seriesB), false);
        strictEqual(await seriesHelper.isSameSeries(seriesB, seriesA), false);

    });

    async function fullseriesA() {
        const series = new Series();
        const anidb = new InfoProviderLocalData('10894', 'anidb');
        anidb.addSeriesName(new Name('danmachi', 'x-jat', NameType.SHORT));
        anidb.addSeriesName(new Name('DanMachi : Familia Myth', 'fr', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('DanMachi: ¿Está mal seducir chicas en un calabozo?', 'es-LA', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('DanMachi: ¿Qué tiene de malo intentar ligar en una mazmorra?', 'es', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('Dungeon ni Deai o Motomeru no wa Machigatte Iru Darouka: Familia Myth', 'x-jat', NameType.MAIN));
        anidb.addSeriesName(new Name('Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka', 'x-jat', NameType.SYN));
        anidb.addSeriesName(new Name('Is het Verkeerd om Meisjes Op te Pikken in Een Dungeon?', 'nl', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('Is It Wrong to Try to Pick Up Girls in a Dungeon?', 'en', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('В подземелье я пойду, там красавицу найду', 'ru', NameType.SYN));
        anidb.addSeriesName(new Name('Невже шукати дівчину в підземеллі - неправильно?', 'uk', NameType.SYN));
        anidb.addSeriesName(new Name('던전에서 만남을 추구하면 안 되는 걸까?', 'ko', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('ダンジョンに出会いを求めるのは間違っているだろうか FAMILIA MYTH', 'jat', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('在地下城寻求邂逅是否搞错了什么', 'zh-Hans', NameType.OFFICIAL));
        anidb.infoStatus = ProviderInfoStatus.BASIC_INFO;
        await series.addInfoProvider(anidb);
        const tvmaze = new InfoProviderLocalData('5312', 'tvmaze');
        tvmaze.mediaType = MediaType.ANIME;
        tvmaze.releaseYear = 2015;
        tvmaze.runTime = 25;
        tvmaze.score = 7.4;
        tvmaze.addSeriesName(new Name('Is It Wrong to Try to Pick Up Girls in a Dungeon?', 'en', NameType.OFFICIAL));
        await series.addInfoProvider(tvmaze);
        const tvdb = new InfoProviderLocalData(289882, 'tvdb');
        tvdb.addSeriesName(new Name('is-it-wrong-to-try-to-pick-up-girls-in-a-dungeon', 'slug', NameType.SLUG));
        tvdb.addSeriesName(new Name('Is it Wrong to Try to Pick Up Girls in a Dungeon?', 'slug', NameType.SLUG));
        await series.addInfoProvider(tvdb);
        const imdb = new InfoProviderLocalData('tt4728568', 'imdb');
        await series.addInfoProvider(imdb);
        const tmdb = new InfoProviderLocalData(62745, 'tmdb');
        await series.addInfoProvider(tmdb);
        const trakt = new ListProviderLocalData(94090, 'Trakt');
        trakt.episodes = 25;
        trakt.publicScore = 7.87259259259259;
        trakt.releaseYear = 2015;
        trakt.runTime = 25;
        trakt.infoStatus = ProviderInfoStatus.BASIC_INFO;
        trakt.addSeriesName(new Name('Is it Wrong to Try to Pick Up Girls in a Dungeon?', 'en', NameType.OFFICIAL));
        trakt.addSeriesName(new Name('is-it-wrong-to-try-to-pick-up-girls-in-a-dungeon', 'slug', NameType.SLUG));
        await series.addListProvider(trakt);
        const anilist = new ListProviderLocalData(20920, 'AniList');
        anilist.episodes = 13;
        anilist.releaseYear = 2015;
        anilist.sequelIds.push(21660);
        anilist.alternativeIds.push(85161);
        anilist.infoStatus = ProviderInfoStatus.BASIC_INFO;
        anilist.addSeriesName(new Name('Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka', 'x-jap', NameType.OFFICIAL));
        anilist.addSeriesName(new Name('Is It Wrong to Try to Pick Up Girls in a Dungeon?', 'unknown', NameType.MAIN));
        anilist.addSeriesName(new Name('ダンジョンに出会いを求めるのは間違っているだろうか', 'jap', NameType.UNKNOWN));
        await series.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(anilist, new Season([1])));
        return series;
    }

    async function fullseriesB() {
        const series = new Series();
        const anidb = new InfoProviderLocalData('10894', 'anidb');
        anidb.addSeriesName(new Name('danmachi', 'x-jat', NameType.SHORT));
        anidb.addSeriesName(new Name('DanMachi : Familia Myth', 'fr', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('DanMachi: ¿Está mal seducir chicas en un calabozo?', 'es-LA', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('DanMachi: ¿Qué tiene de malo intentar ligar en una mazmorra?', 'es', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('Dungeon ni Deai o Motomeru no wa Machigatte Iru Darouka: Familia Myth', 'x-jat', NameType.MAIN));
        anidb.addSeriesName(new Name('Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka', 'x-jat', NameType.SYN));
        anidb.addSeriesName(new Name('Is het Verkeerd om Meisjes Op te Pikken in Een Dungeon?', 'nl', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('Is It Wrong to Try to Pick Up Girls in a Dungeon?', 'en', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('В подземелье я пойду, там красавицу найду', 'ru', NameType.SYN));
        anidb.addSeriesName(new Name('Невже шукати дівчину в підземеллі - неправильно?', 'uk', NameType.SYN));
        anidb.addSeriesName(new Name('던전에서 만남을 추구하면 안 되는 걸까?', 'ko', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('ダンジョンに出会いを求めるのは間違っているだろうか FAMILIA MYTH', 'jat', NameType.OFFICIAL));
        anidb.addSeriesName(new Name('在地下城寻求邂逅是否搞错了什么', 'zh-Hans', NameType.OFFICIAL));
        anidb.infoStatus = ProviderInfoStatus.BASIC_INFO;
        const tvmaze = new InfoProviderLocalData('5312', 'tvmaze');
        tvmaze.mediaType = MediaType.ANIME;
        tvmaze.releaseYear = 2015;
        tvmaze.runTime = 25;
        tvmaze.score = 7.4;
        tvmaze.addSeriesName(new Name('Is It Wrong to Try to Pick Up Girls in a Dungeon?', 'en', NameType.OFFICIAL));
        await series.addInfoProvider(tvmaze);
        const tvdb = new InfoProviderLocalData(289882, 'tvdb');
        tvdb.addSeriesName(new Name('is-it-wrong-to-try-to-pick-up-girls-in-a-dungeon', 'slug', NameType.SLUG));
        tvdb.addSeriesName(new Name('Is it Wrong to Try to Pick Up Girls in a Dungeon?', 'slug', NameType.SLUG));
        await series.addInfoProvider(tvdb);
        const imdb = new InfoProviderLocalData('tt4728568', 'imdb');
        await series.addInfoProvider(imdb);
        const tmdb = new InfoProviderLocalData(62745, 'tmdb');
        await series.addInfoProvider(tmdb);
        const trakt = new ListProviderLocalData(94090, 'Trakt');
        trakt.episodes = 25;
        trakt.publicScore = 7.87259259259259;
        trakt.releaseYear = 2015;
        trakt.runTime = 25;
        trakt.infoStatus = ProviderInfoStatus.BASIC_INFO;
        trakt.addSeriesName(new Name('Is it Wrong to Try to Pick Up Girls in a Dungeon?', 'en', NameType.OFFICIAL));
        trakt.addSeriesName(new Name('is-it-wrong-to-try-to-pick-up-girls-in-a-dungeon', 'slug', NameType.SLUG));
        await series.addListProvider(trakt);
        const anilist = new ListProviderLocalData(101167, 'AniList');
        anilist.episodes = 12;
        anilist.releaseYear = 2019;
        anilist.prequelIds.push(20920);
        anilist.alternativeIds.push(85161);
        anilist.infoStatus = ProviderInfoStatus.BASIC_INFO;
        anilist.addSeriesName(new Name('Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka II', 'x-jap', NameType.OFFICIAL));
        anilist.addSeriesName(new Name('Is It Wrong to Try to Pick Up Girls in a Dungeon? II', 'unknown', NameType.MAIN));
        anilist.addSeriesName(new Name('ダンジョンに出会いを求めるのは間違っているだろうかⅡ', 'jap', NameType.UNKNOWN));
        await series.addListProvider(anilist);
        return series;
    }

});
