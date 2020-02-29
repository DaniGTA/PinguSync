import * as assert from 'assert';
import { MediaType } from '../../src/backend/controller/objects/meta/media-type';
import TitleCheckHelper from '../../src/backend/helpFunctions/name-helper/title-check-helper';
import TestHelper from '../test-helper';
describe('Title Checker | Some title examples', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });

    test('should match', async () => {
        assert.equal(await TitleCheckHelper.checkNames(['Title: Check, It`s a Test` but` its still a test!'], ['Title ~Check, It’s a test but’ its still a test!~']), true);
        assert.equal(await TitleCheckHelper.checkNames(['Kiniro Mosaic'], ['Kin`iro Mosaic', 'Kiniro Mosaic', 'Kinmosa', 'Kinmoza!', 'きんいろモザイク']), true);
        assert.equal(await TitleCheckHelper.checkNames(['この素晴らしい世界に祝福を！紅伝説'], ['この素晴らしい世界に祝福を! 紅伝説']), true);
        assert.equal(await TitleCheckHelper.checkNames(['Title'], ['Title XX']), true);
        assert.equal(await TitleCheckHelper.checkNames(['Title 2nd Season'], ['Title 2']), true);
        assert.equal(await TitleCheckHelper.checkNames(['Title Movie: test test'], ['Title: test test']), true);

    });

    test('should not match', async () => {
        assert.equal(await TitleCheckHelper.checkNames(['Title'], ['Title Super Duper']), false);
        assert.equal(await TitleCheckHelper.checkNames(['ATitle'], ['BTitle']), false, '\'ATitle\' should fast match \'BTitle\'');
    });

    test('should match (fastMatch)', async () => {
        assert.equal(await TitleCheckHelper.fastMatch(['Abc'], ['abcdefg', 'ABCD']), true, '\'Abc\' should fast match \'abcdefg\'');
        assert.equal(await TitleCheckHelper.fastMatch(['Title Season 2'], ['title s2']), true, '\'Title Season 2\' should fast match \'title s2\'');
        assert.equal(await TitleCheckHelper.fastMatch(['Title Title Season 2'], ['title title II']), true, '\'Title Title Season 2\' should fast match \'title title II\'');
        assert.equal(await TitleCheckHelper.fastMatch(['ATitle'], ['BTitle']), false, '\'ATitle\' should fast match \'BTitle\'');
        assert.equal(await TitleCheckHelper.fastMatch(['Title ABC'], ['Title CBA']), true, '\'Title ABC\' should fast match \'Title CBA\'');
        assert.equal(await TitleCheckHelper.fastMatch(['Test'], ['Test III']), true, '\'Test\' should fast match \'Test III\'');
        assert.equal(await TitleCheckHelper.fastMatch(['TITLE!'], ['Title!']), true, '\'TITLE!\' should fast match \'Title!\'');
        assert.equal(await TitleCheckHelper.fastMatch(['この素晴らしい世界に祝福を！紅伝説'], ['この素晴らしい世界に祝福を! 紅伝説']), true, '\'この素晴らしい世界に祝福を！紅伝説\' should fast match \'この素晴らしい世界に祝福を! 紅伝説\'');
        return;
    });

    test('should match (skipFastMatch)', async () => {
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title'], ['ATitle', 'title']), true);
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title'], ['ATitle', 'Title']), true);
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title!'], ['ATitle', 'title']), true);
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title!?'], ['ATitle', 'title']), true);
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'Title']), true);
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title! Season 3'], ['ATitle', 'Title']), true);
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'title']), true);
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'Ctitle']), false);
        assert.equal(await TitleCheckHelper.checkAnimeNamesInArray(['Title!'], ['ATitle', 'titleG']), false);
        return;
    });
    test('should remove season from title', async () => {
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title Season 2'), 'Title');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title III'), 'Title');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title Episode 2'), 'Title Episode 2');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2'), 'Title');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2nd -Test-'), 'Title -Test-');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title XX'), 'Title');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title'), 'Title');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2nd Season'), 'Title');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('Title 3nd Season'), 'Title');
        assert.equal(await TitleCheckHelper.removeSeasonMarkesFromTitle('この素晴らしい世界に祝福を！紅伝説'), 'この素晴らしい世界に祝福を！紅伝説');
        return;
    });

    test('should remove MediaType from title', async () => {
        assert.equal(await TitleCheckHelper.removeMediaTypeFromTitle('Title: Movie'), 'Title');
        assert.equal(await TitleCheckHelper.removeMediaTypeFromTitle('Title Movie'), 'Title');
        assert.equal(await TitleCheckHelper.removeMediaTypeFromTitle('Title: Special'), 'Title');
        assert.equal(await TitleCheckHelper.removeMediaTypeFromTitle('Title Special'), 'Title');
        assert.equal(await TitleCheckHelper.removeMediaTypeFromTitle('Title: Specials'), 'Title');
        assert.equal(await TitleCheckHelper.removeMediaTypeFromTitle('Title Specials'), 'Title');
        assert.equal(await TitleCheckHelper.removeMediaTypeFromTitle('Title Movie: Test Test'), 'Title: Test Test');
    });

    test('should detect MediaType from title', async () => {
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title: Movie'), MediaType.MOVIE);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Movie'), MediaType.MOVIE);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Movie: Test Test'), MediaType.MOVIE);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title: Special'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Special'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title: Specials'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Specials'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Test te test Specials'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title'), MediaType.UNKOWN);
    });
});
