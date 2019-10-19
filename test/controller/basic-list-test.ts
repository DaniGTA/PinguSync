import ListController from "../../src/backend/controller/list-controller";

import MainListManager from "../../src/backend/controller/main-list-manager/main-list-manager";

import MainListLoader from "../../src/backend/controller/main-list-manager/main-list-loader";

import ProviderList from "../../src/backend/controller/provider-manager/provider-list";

import TestProvider from "./objects/testClass/testProvider";
import Series from '../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import { fail } from 'assert';
import logger from '../../src/backend/logger/logger';
import TraktProvider from '../../src/backend/api/trakt/trakt-provider';

describe('Basic List | Testrun', () => {
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
        MainListManager['mainList'] = [];
    });
});