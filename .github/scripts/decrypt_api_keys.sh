#!/bin/sh

cd ../../
# --batch to prevent interactive command --yes to assume "yes" for questions
gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/omdb.json $GITHUB_WORKSPACE/src/keys/api/omdb.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/Simkl.json $GITHUB_WORKSPACE/src/keys/api/Simkl.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/Trakt.json $GITHUB_WORKSPACE/src/keys/api/Trakt.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/tvdb.json $GITHUB_WORKSPACE/src/keys/api/tvdb.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/AniList.json $GITHUB_WORKSPACE/src/keys/api/AniList.json.gpg