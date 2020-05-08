#!/bin/sh

cd ../../
# --batch to prevent interactive command --yes to assume "yes" for questions
gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $HOME/src/keys/api/omdb.json $HOME/src/keys/api/omdb.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $HOME/src/keys/api/Simkl.json $HOME/src/keys/api/Simkl.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $HOME/src/keys/api/Trakt.json $HOME/src/keys/api/Trakt.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $HOME/src/keys/api/tvdb.json $HOME/src/keys/api/tvdb.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$1" --output $HOME/src/keys/api/AniList.json $HOME/src/keys/api/AniList.json.gpg