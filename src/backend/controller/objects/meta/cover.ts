import { ImageSize } from './image-size'

/**
 * Create a Cover or Poster for the media
 */
export default class Cover {
    public url: string
    public size: ImageSize
    public failed = false
    constructor(url: string, size: ImageSize = ImageSize.UNKNOWN) {
        this.url = url
        this.size = size
    }
}
