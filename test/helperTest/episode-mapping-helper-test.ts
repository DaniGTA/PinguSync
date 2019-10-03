
import { InfoProviderLocalData } from '../../src/backend/controller/objects/info-provider-local-data';
import { ListProviderLocalData } from '../../src/backend/controller/objects/list-provider-local-data';
import Episode from '../../src/backend/controller/objects/meta/episode/episode';
import Series from '../../src/backend/controller/objects/series';
import EpisodeMappingHelper from '../../src/backend/helpFunctions/episode-mapping-helper/episode-mapping-helper';
import { strictEqual, fail, notStrictEqual, equal } from 'assert';
import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import TestProvider from '../controller/objects/testClass/testProvider';
import EpisodeTitle from '../../src/backend/controller/objects/meta/episode/episode-title';
import listHelper from '../../src/backend/helpFunctions/list-helper';
import { EpisodeType } from '../../src/backend/controller/objects/meta/episode/episode-type';

describe('episode mapping helper tests', () => {
    var lc = new ListController(true);

    before(() => {
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => { return [] };
        MainListLoader['saveData'] = async () => { };
    })
    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider("Test"), new TestProvider("")];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    })
    it('should map same episodes length from different providers', async () => {
         const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA'); 
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1));
        aProvider.detailEpisodeInfo.push(new Episode(2));
        aProvider.detailEpisodeInfo.push(new Episode(3));
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));
        
        aSeries.addProviderDatas(bProvider);

        // Testing
        
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Extract results.

        const aEpisodeInfo1 = result.find(x => x.id == aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = result.find(x => x.id == aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = result.find(x => x.id == aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = result.find(x => x.id == bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = result.find(x => x.id == bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = result.find(x => x.id == bProvider.detailEpisodeInfo[2].id);
        
        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1);
            strictEqual(aEpisodeInfo2.mappedTo.length, 1);
            strictEqual(aEpisodeInfo3.mappedTo.length, 1);

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo1.id);
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo2.id);
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo3.id);

            strictEqual(bEpisodeInfo1.mappedTo.length, 1);
            strictEqual(bEpisodeInfo2.mappedTo.length, 1);
            strictEqual(bEpisodeInfo3.mappedTo.length, 1);

            strictEqual(bEpisodeInfo1.mappedTo[0].id, aEpisodeInfo1.id);
            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo2.id);
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo3.id);
        }       
    });

    it('should map same episodes length from different providers without detailedEpisodes', async () => {
         const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA'); 
        aProvider.targetSeason = 1;
        aProvider.episodes = 3;
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.episodes = 3;
        
        aSeries.addProviderDatas(bProvider);

        // Testing
        
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Result checking
        strictEqual(result.length, 6);
        for (const episode of result) {
            strictEqual(episode.mappedTo.length, 1);
            strictEqual(episode.mappedTo[0].episodeNumber, episode.episodeNumber);
            notStrictEqual(episode.mappedTo[0].provider, episode.provider);
        }           
    });

    it('should map episodes length with detailedEpisodes', async () => {
         const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA'); 
        aProvider.targetSeason = 1;
        aProvider.episodes = 3;
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));
        
        aSeries.addProviderDatas(bProvider);

        // Testing
        
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Result checking
        strictEqual(result.length, 6);
        for (const episode of result) {
            strictEqual(episode.mappedTo.length, 1);
            strictEqual(episode.mappedTo[0].episodeNumber, episode.episodeNumber);
            notStrictEqual(episode.mappedTo[0].provider, episode.provider);
        }           
    });

      it('should map find unmapped episodes in the sequel', async () => {
          const aSeries = new Series();
          const sequelOfaSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA'); 
        aProvider.targetSeason = 1;
        aProvider.episodes = 3;
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1));
        bProvider.detailEpisodeInfo.push(new Episode(5, 1));
        bProvider.detailEpisodeInfo.push(new Episode(6, 1));
          
        aSeries.addProviderDatas(bProvider);

          
        // Sequel
          
        const cProvider = new InfoProviderLocalData('testA'); 
        cProvider.targetSeason = 2;
        cProvider.episodes = 3;
        
        sequelOfaSeries.addProviderDatas(cProvider);
          
        // Testing
        MainListManager['mainList'] = [sequelOfaSeries]
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Result checking
        strictEqual(result.length, 6);
        for (const episode of result) {
            strictEqual(episode.mappedTo.length, 1);
            strictEqual(episode.mappedTo[0].episodeNumber, episode.episodeNumber);
            notStrictEqual(episode.mappedTo[0].provider, episode.provider);
        }           
      });
    
    it('should map by episode name', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA');
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1, undefined, [new EpisodeTitle('Fist round')]));
        aProvider.detailEpisodeInfo.push(new Episode(2, undefined, [new EpisodeTitle('Second round')]));
        aProvider.detailEpisodeInfo.push(new Episode(3, undefined, [new EpisodeTitle('Third round')]));
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1, [new EpisodeTitle('Fist round')]));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1, [new EpisodeTitle('Second round')]));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1, [new EpisodeTitle('Thrid round')]));
        aSeries.addProviderDatas(bProvider);

        // Testing
        
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Extract results.

        const aEpisodeInfo1 = result.find(x => x.id == aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = result.find(x => x.id == aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = result.find(x => x.id == aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = result.find(x => x.id == bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = result.find(x => x.id == bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = result.find(x => x.id == bProvider.detailEpisodeInfo[2].id);
        const bEpisodeInfo4 = result.find(x => x.id == bProvider.detailEpisodeInfo[3].id);
        
        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1);
            strictEqual(aEpisodeInfo2.mappedTo.length, 1);
            strictEqual(aEpisodeInfo3.mappedTo.length, 1);

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo2.id);
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo3.id);
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo4.id);

            strictEqual(bEpisodeInfo1.mappedTo.length, 0);
            strictEqual(bEpisodeInfo2.mappedTo.length, 1);
            strictEqual(bEpisodeInfo3.mappedTo.length, 1);
            strictEqual(bEpisodeInfo4.mappedTo.length, 1);

            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo1.id);
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo2.id);
            strictEqual(bEpisodeInfo4.mappedTo[0].id, aEpisodeInfo3.id);
        }       
    });

    it('should map by episode name (false name)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA');
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1, undefined, [new EpisodeTitle('Fist round')]));
        aProvider.detailEpisodeInfo.push(new Episode(2, undefined, [new EpisodeTitle('Second round')]));
        aProvider.detailEpisodeInfo.push(new Episode(3, undefined, [new EpisodeTitle('Third round')]));
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1, [new EpisodeTitle('Special round')]));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1, [new EpisodeTitle('Fist round')]));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1, [new EpisodeTitle('Second round')]));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1, [new EpisodeTitle('Thrid round')]));
        aSeries.addProviderDatas(bProvider);

        // Testing
        
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Extract results.

        const aEpisodeInfo1 = result.find(x => x.id == aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = result.find(x => x.id == aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = result.find(x => x.id == aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = result.find(x => x.id == bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = result.find(x => x.id == bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = result.find(x => x.id == bProvider.detailEpisodeInfo[2].id);
        const bEpisodeInfo4 = result.find(x => x.id == bProvider.detailEpisodeInfo[3].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1);
            strictEqual(aEpisodeInfo2.mappedTo.length, 1);
            strictEqual(aEpisodeInfo3.mappedTo.length, 1);

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo2.id);
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo3.id);
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo4.id);

            strictEqual(bEpisodeInfo1.mappedTo.length, 0);
            strictEqual(bEpisodeInfo2.mappedTo.length, 1);
            strictEqual(bEpisodeInfo3.mappedTo.length, 1);
            strictEqual(bEpisodeInfo4.mappedTo.length, 1);

            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo1.id);
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo2.id);
            strictEqual(bEpisodeInfo4.mappedTo[0].id, aEpisodeInfo3.id);
        }       
    });

    it('should map by episode name (small info)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA');
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1,undefined, [new EpisodeTitle('First round')]));
        aProvider.detailEpisodeInfo.push(new Episode(2));
        aProvider.detailEpisodeInfo.push(new Episode(3));
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1, [new EpisodeTitle('Special round')]));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1, [new EpisodeTitle('First round')]));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1));
        aSeries.addProviderDatas(bProvider);

        // Testing
        
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Extract results.

        const aEpisodeInfo1 = result.find(x => x.id == aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = result.find(x => x.id == aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = result.find(x => x.id == aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = result.find(x => x.id == bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = result.find(x => x.id == bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = result.find(x => x.id == bProvider.detailEpisodeInfo[2].id);
        const bEpisodeInfo4 = result.find(x => x.id == bProvider.detailEpisodeInfo[3].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1);
            strictEqual(aEpisodeInfo2.mappedTo.length, 1);
            strictEqual(aEpisodeInfo3.mappedTo.length, 1);

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo2.id);
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo3.id);
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo4.id);

            strictEqual(bEpisodeInfo1.mappedTo.length, 0);
            strictEqual(bEpisodeInfo2.mappedTo.length, 1);
            strictEqual(bEpisodeInfo3.mappedTo.length, 1);
            strictEqual(bEpisodeInfo4.mappedTo.length, 1);

            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo1.id);
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo2.id);
            strictEqual(bEpisodeInfo4.mappedTo[0].id, aEpisodeInfo3.id);
        }       
    });

    it('should map by episode name (small info specials)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA');
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1));
        aProvider.detailEpisodeInfo.push(new Episode(2,undefined, [new EpisodeTitle('Special round')]));
        aProvider.detailEpisodeInfo.push(new Episode(3));
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1, [new EpisodeTitle('Special round')]));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1));
        aSeries.addProviderDatas(bProvider);

        // Testing
        
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Extract results.

        const aEpisodeInfo1 = result.find(x => x.id == aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = result.find(x => x.id == aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = result.find(x => x.id == aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = result.find(x => x.id == bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = result.find(x => x.id == bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = result.find(x => x.id == bProvider.detailEpisodeInfo[2].id);
        const bEpisodeInfo4 = result.find(x => x.id == bProvider.detailEpisodeInfo[3].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1);
            strictEqual(aEpisodeInfo2.mappedTo.length, 1);
            strictEqual(aEpisodeInfo3.mappedTo.length, 1);

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo2.id);
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo1.id);
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo3.id);

            strictEqual(bEpisodeInfo1.mappedTo.length, 1);
            strictEqual(bEpisodeInfo2.mappedTo.length, 1);
            strictEqual(bEpisodeInfo3.mappedTo.length, 1);
            strictEqual(bEpisodeInfo4.mappedTo.length, 0);

            strictEqual(bEpisodeInfo1.mappedTo[0].id, aEpisodeInfo2.id);
            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo1.id);
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo3.id);
        }       
    });

    it('should sort episode list right', async () => {

        let episodes: Episode[] = [];
        const episode1 = new Episode(1);
        const episode2s1 = new Episode(2, 1);
        const episode3 = new Episode(3);
        const episode4 = new Episode(4, 1);
        episode4.type = EpisodeType.SPECIAL;
        const episode1s2 = new Episode(1, 2);
        const episode2s2 = new Episode(2, 2);

        episodes.push(episode1);
        episodes.push(episode2s1);
        episodes.push(episode3);
        episodes.push(episode4);
        episodes.push(episode1s2);
        episodes.push(episode2s2);

        episodes = await listHelper.shuffle(episodes);

        // Testing

        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.sortingEpisodeListByEpisodeNumber(episodes);

        // Result checking

        console.log(result);

        strictEqual(result[0], episode1,'0 should be EP01S01');
        strictEqual(result[1], episode2s1,'1 should be EP02S01');
        strictEqual(result[2], episode3,'2 should be EP03S01');
        strictEqual(result[3], episode1s2,'3 should be EP01S02');
        strictEqual(result[4], episode2s2,'4 should be EP02S02');
        strictEqual(result[5], episode4,'5 should be EP04S01');
    });
});