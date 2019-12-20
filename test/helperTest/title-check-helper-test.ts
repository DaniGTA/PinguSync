import * as assert from 'assert';
import { MediaType } from '../../src/backend/controller/objects/meta/media-type';
import titleCheckHelper from '../../src/backend/helpFunctions/title-check-helper';
import TestHelper from '../test-helper';
describe('Title Checker | Some title examples', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });

    test('should match', async () => {
        assert.equal(await titleCheckHelper.checkNames(['Title: Check, It`s a Test` but` its still a test!'], ['Title ~Check, It’s a test but’ its still a test!~']), true);
        assert.equal(await titleCheckHelper.checkNames(['Kiniro Mosaic'], ['Kin`iro Mosaic', 'Kiniro Mosaic', 'Kinmosa', 'Kinmoza!', 'きんいろモザイク']), true);
        assert.equal(await titleCheckHelper.checkNames(['この素晴らしい世界に祝福を！紅伝説'], ['この素晴らしい世界に祝福を! 紅伝説']), true);
        assert.equal(await titleCheckHelper.checkNames(['Title'], ['Title XX']), true);
        assert.equal(await titleCheckHelper.checkNames(['Title 2nd Season'], ['Title 2']), true);
        assert.equal(await titleCheckHelper.checkNames(['Title Movie: test test'], ['Title: test test']), true);

    });

    test('should not match', async () => {
        assert.equal(await titleCheckHelper.checkNames(['Title'], ['Title Super Duper']), false);
        assert.equal(await titleCheckHelper.checkNames(['ATitle'], ['BTitle']), false, '\'ATitle\' should fast match \'BTitle\'');
    });

    test('should match (fastMatch)', async () => {
        assert.equal(await titleCheckHelper.fastMatch(['Abc'], ['abcdefg', 'ABCD']), true, '\'Abc\' should fast match \'abcdefg\'');
        assert.equal(await titleCheckHelper.fastMatch(['Title Season 2'], ['title s2']), true, '\'Title Season 2\' should fast match \'title s2\'');
        assert.equal(await titleCheckHelper.fastMatch(['Title Title Season 2'], ['title title II']), true, '\'Title Title Season 2\' should fast match \'title title II\'');
        assert.equal(await titleCheckHelper.fastMatch(['ATitle'], ['BTitle']), false, '\'ATitle\' should fast match \'BTitle\'');
        assert.equal(await titleCheckHelper.fastMatch(['Title ABC'], ['Title CBA']), true, '\'Title ABC\' should fast match \'Title CBA\'');
        assert.equal(await titleCheckHelper.fastMatch(['Test'], ['Test III']), true, '\'Test\' should fast match \'Test III\'');
        assert.equal(await titleCheckHelper.fastMatch(['TITLE!'], ['Title!']), true, '\'TITLE!\' should fast match \'Title!\'');
        assert.equal(await titleCheckHelper.fastMatch(['この素晴らしい世界に祝福を！紅伝説'], ['この素晴らしい世界に祝福を! 紅伝説']), true, '\'この素晴らしい世界に祝福を！紅伝説\' should fast match \'この素晴らしい世界に祝福を! 紅伝説\'');
        return;
    });

    test('should match (skipFastMatch)', async () => {
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title'], ['ATitle', 'title']), true);
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title'], ['ATitle', 'Title']), true);
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title!'], ['ATitle', 'title']), true);
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title!?'], ['ATitle', 'title']), true);
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'Title']), true);
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title! Season 3'], ['ATitle', 'Title']), true);
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'title']), true);
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'Ctitle']), false);
        assert.equal(await titleCheckHelper.checkAnimeNamesInArray(['Title!'], ['ATitle', 'titleG']), false);
        return;
    });
    test('should remove season from title', async () => {
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title Season 2'), 'Title');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title III'), 'Title');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title Episode 2'), 'Title Episode 2');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title 2'), 'Title');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title 2nd -Test-'), 'Title -Test-');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title XX'), 'Title');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title'), 'Title');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title 2nd Season'), 'Title');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('Title 3nd Season'), 'Title');
        assert.equal(await titleCheckHelper.removeSeasonMarkesFromTitle('この素晴らしい世界に祝福を！紅伝説'), 'この素晴らしい世界に祝福を！紅伝説');
        return;
    });

    test('should remove MediaType from title', async () => {
        assert.equal(await titleCheckHelper.removeMediaTypeFromTitle('Title: Movie'), 'Title');
        assert.equal(await titleCheckHelper.removeMediaTypeFromTitle('Title Movie'), 'Title');
        assert.equal(await titleCheckHelper.removeMediaTypeFromTitle('Title: Special'), 'Title');
        assert.equal(await titleCheckHelper.removeMediaTypeFromTitle('Title Special'), 'Title');
        assert.equal(await titleCheckHelper.removeMediaTypeFromTitle('Title: Specials'), 'Title');
        assert.equal(await titleCheckHelper.removeMediaTypeFromTitle('Title Specials'), 'Title');
        assert.equal(await titleCheckHelper.removeMediaTypeFromTitle('Title Movie: Test Test'), 'Title: Test Test');
    });

    test('should detect MediaType from title', async () => {
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title: Movie'), MediaType.MOVIE);
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title Movie'), MediaType.MOVIE);
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title Movie: Test Test'), MediaType.MOVIE);
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title: Special'), MediaType.SPECIAL);
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title Special'), MediaType.SPECIAL);
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title: Specials'), MediaType.SPECIAL);
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title Specials'), MediaType.SPECIAL);
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title Test te test Specials'), MediaType.SPECIAL);
        assert.equal(await titleCheckHelper.getMediaTypeFromTitle('Title'), MediaType.UNKOWN);
    });

});
