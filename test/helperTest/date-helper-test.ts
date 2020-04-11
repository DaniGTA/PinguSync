import KitsuProvider from '../../src/backend/api/information-providers/kitsu/kitsu-provider';
import MalProvider from '../../src/backend/api/information-providers/mal/mal-provider';
import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list';
import dateHelper from '../../src/backend/helpFunctions/date-helper';


describe('Date Helper Test', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new KitsuProvider(), new MalProvider()];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
    });

    test('It should add 1 day', async () => {
        const date = new Date();
        const newDate = dateHelper.addDays(date, 1);
        // equal(date.getUTCDay() + 1, newDate.getUTCDay());
        // TODO fix test when node v. 14 is out (use new date api);
    });
});
