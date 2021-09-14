export default `mutation ($mediaId: Int, $progress: Int) { 
    SaveMediaListEntry (mediaId: $mediaId, progress: $progress) {
        id
        status
        progress
    }
}`