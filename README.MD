# Agility


## Bitbucket
### Create oauth configuration
Go to Bitbucket Settings > OAuth > Add Consumer
After creation save both key and secret 

### Authorization

Go to https://bitbucket.org/site/oauth2/authorize?response_type=code&client_id={key from oauth}

Give permission to access you account.
Recover code parameter from authorization response

### Access Token

Encode your key and secret with base64 {key}:{secret}
```
curl -v POST https://bitbucket.org/site/oauth2/access_token -H'Authorization: Basic {key_and_scret_base64_encoded}' -d'grant_type=authorization_code' -d'code={code_from_authorization}'
```

### Refresh Access Code

When you genenerate the access token you also get the refresh code. Save it so you can get another access code since it just last 1 hour.
```
curl -X POST -H'Authorization: Basic {key_and_scret_base64_encoded}' https://bitbucket.org/site/oauth2/access_token -d grant_type=refresh_token -d refresh_token={refresh_token}
```