import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import TestHelper from '../test-helper';

describe('Basic List | Testrun', () => {
    const lc = new ListController(true);

    before(() => {
       TestHelper.mustHaveBefore();
    });
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });
});
