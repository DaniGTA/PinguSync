export default `
mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int) {
    SaveMediaListEntry (mediaId: $mediaId, status: $status,progress: $progress) {
        id,
        status,
        progress
    }
}`;
