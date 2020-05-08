#!/bin/sh

cd ../../
# --batch to prevent interactive command --yes to assume "yes" for questions
gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/omdb.json $GITHUB_WORKSPACE/src/keys/api/omdb.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $GITHUB_WORKSPACE/src/keys/api/Simkl.json $GITHUB_WORKSPACE/src/keys/api/Simkl.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output ./src/keys/api/Trakt.json ./src/keys/api/Trakt.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output ../../src/keys/api/tvdb.json ../../src/keys/api/tvdb.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output src/keys/api/AniList.json src/keys/api/AniList.json.gpg