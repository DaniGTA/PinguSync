
import { deepEqual, fail } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';
import Series, { WatchStatus } from '../../../src/backend/controller/objects/series';
import { MediaType } from '../../../src/backend/controller/objects/meta/media-type';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../../src/backend/controller/objects/meta/name';
import { NameType } from '../../../src/backend/controller/objects/meta/name-type';
import providerHelper from '../../../src/backend/helpFunctions/provider/provider-helper';

describe('AniDB Tests', () => {
    it('should allow download (1/2)', async () => {
        var x = new AniDBProvider(false);
        AniDBProvider['anidbNameManager'].lastDownloadTime = undefined;
        deepEqual(x.InternalTesting().needDownload(), true);
        return;
    })
    it('should allow download (2/2)', async () => {
        var a = new AniDBProvider(false);
        var twoDaysInMs = 172800000;
        AniDBProvider['anidbNameManager'].lastDownloadTime = new Date(Date.now() - twoDaysInMs * 2);
        deepEqual(a.InternalTesting().needDownload(), true);
        return;
    })
    it('should not allow download', async () => {
        var a = new AniDBProvider(false);
        AniDBProvider['anidbNameManager'].lastDownloadTime = new Date(Date.now());
        deepEqual(a.InternalTesting().needDownload(), false);
        return;
    })

    it('should find id 9579', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new ListProviderLocalData("AniList");
        lpdld.episodes = 12;
        lpdld.fullInfo = true;
        lpdld.targetSeason = 1;
        lpdld.watchStatus = WatchStatus.DROPPED;

        const series = new Series();
        series['cachedSeason'] = 1;
        series['canSync'] = false;
        lpdld['episodes'] = 12;
        lpdld.isNSFW = false;
        lpdld.mediaType = MediaType.SERIES;
        lpdld.releaseYear = 2013;
        lpdld.addSeriesName(new Name("Kiniro Mosaic", "x-jap", NameType.OFFICIAL));
        lpdld.addSeriesName(new Name("KINMOZA!", "en", NameType.OFFICIAL));
        lpdld.addSeriesName(new Name("きんいろモザイク", "jap", NameType.OFFICIAL));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName("Kiniro Mosaic",1);
        
        deepEqual(result[0].mainProvider.id,'9579');
    });

    
    it('should find id 13310', async () => {
        var a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData("AniList");
        lpdld.episodes = 12;
        lpdld.fullInfo = true;
        lpdld.watchStatus = WatchStatus.DROPPED;

        const series = new Series();
        series['cachedSeason'] = -1;
        series['canSync'] = false;
        lpdld.isNSFW = false;
        lpdld.mediaType = MediaType.MOVIE;
        lpdld.releaseYear = 2019;
        lpdld.addSeriesName(new Name("Kono Subarashii Sekai ni Shukufuku wo! Kurenai Densetsu", "x-jap", NameType.OFFICIAL));
        lpdld.addSeriesName(new Name("KONOSUBA -God's blessing on this wonderful world! Movie", "en", NameType.MAIN));
        lpdld.addSeriesName(new Name("この素晴らしい世界に祝福を！紅伝説", "jap", NameType.UNKNOWN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName("この素晴らしい世界に祝福を！紅伝説", -1);
        
        deepEqual(result[0].mainProvider.id,'13310');
    });
    
    it('should find id 13493', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new ListProviderLocalData("AniList");
        lpdld.episodes = 12;
        lpdld.fullInfo = true;
        lpdld.watchStatus = WatchStatus.DROPPED;

        const series = new Series();
        series['cachedSeason'] = 3;
        lpdld.addSeriesName(new Name("Sword Art Online: Alicization", "en", NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName("Sword Art Online: Alicization",3);
        
        deepEqual(result[0].mainProvider.id,'13493');
    });

    it('should find id 14977', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new ListProviderLocalData("AniList");
        lpdld.episodes = 12;
        lpdld.fullInfo = true;
            
        const series = new Series();
        series['cachedSeason'] = 4;
        lpdld.addSeriesName(new Name("Shingeki no Kyojin The Final Season", "x-jap", NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName("Shingeki no Kyojin The Final Season");
        
        deepEqual(result[0].mainProvider.id,'14977');
    });

    it('should find id 3651', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new ListProviderLocalData("AniList");
        lpdld.episodes = 12;
        lpdld.fullInfo = true;
            
        const series = new Series();
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name("Suzumiya Haruhi no Yuuutsu", "x-jap", NameType.MAIN));
        lpdld.addSeriesName(new Name("The Melancholy of Haruhi Suzumiya", "unkown", NameType.MAIN));
        lpdld.addSeriesName(new Name("涼宮ハルヒの憂鬱", "x-jap", NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName("The Melancholy of Haruhi Suzumiya",1);
        
        deepEqual(result[0].mainProvider.id,'3651');
    });
    it('should find id 8550', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new ListProviderLocalData("AniList");
        lpdld.episodes = 12;
        lpdld.fullInfo = true;
            
        const series = new Series();
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name("Hunter x Hunter (2011)", NameType.MAIN));
        lpdld.addSeriesName(new Name("ハンター×ハンター (2011)", "jap", NameType.MAIN));
        await series.addListProvider(lpdld);
            const result = await a.getMoreSeriesInfoByName("Hunter x Hunter (2011)",1);
        
        deepEqual(result[0].mainProvider.id,'8550');
    });

    it('should find Danshi', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new ListProviderLocalData("AniList");
        lpdld.episodes = 12;
        lpdld.fullInfo = true;
            
        const series = new Series();
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name("Danshi Koukousei no Nichijou", NameType.MAIN));
        lpdld.addSeriesName(new Name("Daily Lives of High School Boys", "jap", NameType.MAIN));
        lpdld.addSeriesName(new Name("男子高校生の日常", "jap", NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await providerHelper['getProviderSeriesInfo'](series, a);
         deepEqual(result.getAllProviderLocalDatas()[0].id,'8729');
    });

    it('should find nothing', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new ListProviderLocalData("AniList");
        lpdld.episodes = 12;
        lpdld.fullInfo = true;
            
        const series = new Series();
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name("Danshi Koukousei no Nichijou Specials", NameType.MAIN));
        lpdld.addSeriesName(new Name("Daily Lives of High School Boys Specials", "jap", NameType.MAIN));
        lpdld.addSeriesName(new Name("男子高校生の日常", "jap", NameType.MAIN));
        await series.addListProvider(lpdld);
        try {
            const result = await providerHelper['getProviderSeriesInfo'](series, a);
            fail();
        } catch (err) {
        }
        
    });
});
