# How to add a API Key for local devolopment

## Add new json to folder `/src/keys/api`

    provider-name.json

(like `AniList.json`) (ProviderName must match api name(give in provider class))

## JSON CONTENT

    {
        "secret": "xxx",
        "id": "xxx"
    }

secret = ClientSecret

id = ClientId
