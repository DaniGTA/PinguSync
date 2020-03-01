export default `
query ($id: Int!, $listType: MediaType) {
  MediaListCollection (userId: $id, type: $listType) {
    lists {
      name
      isCustomList
      isSplitCompletedList
      entries {
        ... mediaListEntry
      }
    }
    user {
      id
      name
      avatar {
        large
      }
      mediaListOptions {
        scoreFormat
        rowOrder
      }
    }
  }
}

fragment mediaListEntry on MediaList {
  id
  score
  scoreRaw: score (format: POINT_100)
  progress
  progressVolumes
  repeat
  private
  priority
  notes
  hiddenFromStatusLists
  startedAt {
    year
    month
    day
  }
  completedAt {
    year
    month
    day
  }
  updatedAt
  createdAt
  media {
    id
    title {
      romaji
      english
      native
      userPreferred
    }
    format
    type
    status
    episodes
    relations {
      edges {
        relationType
      }
      nodes{
        id
      }
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    bannerImage
    coverImage {
      large
      medium
    }
  }
}
`;
