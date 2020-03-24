import ExternalProvider from '../api/provider/external-provider';
import { MediaType } from '../controller/objects/meta/media-type';

export default class MediaTypeHelper {
    public static providerSupportMediaType(provider: ExternalProvider, currentMediaType: MediaType): boolean {
        if (currentMediaType === MediaType.UNKOWN) {
            return true;
        }

        if (currentMediaType === MediaType.UNKOWN_SERIES && this.providerSupportUnkownSeriesMediaType(provider)) {
            return true;
        }

        for (const mediaType of provider.supportedMediaTypes) {
            if (mediaType === currentMediaType) {
                return true;
            }
        }
        return false;
    }

    public static providerSupportUnkownSeriesMediaType(provider: ExternalProvider) {
        for (const mediaType of provider.supportedMediaTypes) {
            if (mediaType === MediaType.ANIME ||
                mediaType === MediaType.SERIES ||
                mediaType === MediaType.UNKOWN_SERIES ||
                mediaType === MediaType.UNKOWN) {
                return true;
            }
        }
    }
}
