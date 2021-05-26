#!/bin/sh

cd ../../
# --batch to prevent interactive command --yes to assume "yes" for questions
gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/OMDbProvider.json $GITHUB_WORKSPACE/src/keys/api/OMDbProvider.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/SimklProvider.json $GITHUB_WORKSPACE/src/keys/api/SimklProvider.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/TraktProvider.json $GITHUB_WORKSPACE/src/keys/api/TraktProvider.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/TVDBProvider.json $GITHUB_WORKSPACE/src/keys/api/TVDBProvider.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/AniListProvider.json $GITHUB_WORKSPACE/src/keys/api/AniListProvider.json.gpg