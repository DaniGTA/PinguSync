const NodeEnvironment = require('jest-environment-node');

import MainListLoader from '../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../src/backend/controller/main-list-manager/main-list-manager';
import ProviderDataListLoader from '../src/backend/controller/provider-data-list-manager/provider-data-list-loader';
import ProviderDataListManager from '../src/backend/controller/provider-data-list-manager/provider-data-list-manager';
import WebRequestManager from '../src/backend/controller/web-request-manager/web-request-manager';
import ResponseHelper from './response-helper';


class TestEnvironment extends NodeEnvironment {
    constructor(config: any) {
        super(config);
    }

    public async setup() {
        await super.setup();
        // tslint:disable: no-string-literal
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => [];
        MainListManager['mainList'] = [];
        // tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };

        ProviderDataListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-empty
        ProviderDataListLoader['saveData'] = async () => { };
        ProviderDataListLoader['loadData'] = () => [];
        ProviderDataListManager['providerDataList'] = [];

        WebRequestManager.request = ResponseHelper.mockRequest;

        jest.mock('../src/backend/api/anidb/anidb-provider', () => {
            // tslint:disable-next-line: only-arrow-functions
            return function () {
                // tslint:disable-next-line: no-empty
                return { getData: () => { } };
            };
        });
    }

    public async teardown() {
        await super.teardown();
    }

    public runScript(script: any) {
        return super.runScript(script);
    }

    public handleTestEvent(event: any, state: any) {
        if (event.name === 'test_start') {
            // ...
        }
    }
}

module.exports = TestEnvironment;