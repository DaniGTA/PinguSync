/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nock from 'nock'
import { dirname, basename, join } from 'path'
import 'reflect-metadata'
import crypto from 'crypto'
function prepareScope(scope: any) {
    scope.filteringRequestBody = (body: any, aRecordedBody: any) => {
        if (typeof body !== 'string' || typeof aRecordedBody !== 'string') {
            return body
        }

        const recordedBodyResult = /timestamp:([0-9]+)/.exec(aRecordedBody)
        if (recordedBodyResult) {
            const recordedTimestamp = recordedBodyResult[1]
            return body.replace(/(timestamp):([0-9]+)/g, (match, key, value) => `${key}:${recordedTimestamp}`)
        } else {
            return body
        }
    }
}

/**
 * get current test path
 */
function getTestState(): any {
    if (Symbol && typeof Symbol.for === 'function') {
        const globalStateKey = Symbol.for('$$jest-matchers-object')
        if (globalStateKey) {
            const globalState = (<any>global)[globalStateKey]
            if (globalState) {
                const state = globalState.state
                if (state) {
                    return state
                }
            }
        }
    }
}

function getMD5(s: string) {
    return crypto
        .createHash('md5')
        .update(s)
        .digest('hex')
}

interface NockBackValue {
    nockDone: () => void
    context: nock.BackContext
}

let value: NockBackValue | undefined

global.beforeEach(async () => {
    const state = getTestState()
    const testPath = state.testPath

    const nockBack = nock.back
    nockBack.setMode('record')
    nockBack.fixtures = join(dirname(testPath), '__nocks__')
    value = await nockBack(`${basename(testPath)}.${getMD5(state.currentTestName)}.json`, { before: prepareScope })
    nock.enableNetConnect('127.0.0.1')
})

global.afterEach(async () => {
    if (value) {
        value.nockDone()
        value = undefined
    }
})
