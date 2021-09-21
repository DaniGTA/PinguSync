import { OAuthTokenType } from './o-auth-token-type'

export default class OAuth {
    constructor(
        public accessToken: string,
        public tokenType: OAuthTokenType,
        public created: Date = new Date(),
        public refreshToken?: string,
        public expire?: Date
    ) {}
}
