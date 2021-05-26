import { FailedRequestError } from '../../../controller/objects/meta/failed-request'
import logger from '../../../logger/logger'
import StringHelper from '../../string-helper'

export default class DownloadSettings {
    public static readonly REQUEST_TIMEOUT_IN_MS: number = 12500
    public static readonly MAX_RETRYS_FOR_NAME_SEARCH: number = 5
}
