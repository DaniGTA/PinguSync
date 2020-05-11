import ApiKey from './models/api-key-model';
import logger from '../../logger/logger';
import { readFileSync, existsSync } from 'fs';

/**
 *  Will load API Keys for Providers from the files under: src/key/api/~providername~.json
 */
export default class ApiKeyController {
    public static getApiSecret(providerName: string): string | undefined {
        return this.loadApiCredentials(providerName)?.secret;

    }

    public static getApiId(providerName: string): string | undefined {
        return this.loadApiCredentials(providerName)?.id;
    }

    private static loadApiCredentials(providerName: string): ApiKey | undefined {
        try {
            return JSON.parse(readFileSync('./src/keys/api/' + providerName + '.json', 'UTF-8')) as ApiKey;
        } catch (err) {
            logger.error(err);
            logger.error(`!! API Credentials error for provider: ${providerName}`);
            if (!existsSync('/src/keys/api/' + providerName + '.json')) {
                logger.error(`!! Please create the file src/keys/api/${providerName}.json with the API secret and the API ID`);
            }
        }
        return;
    }
}