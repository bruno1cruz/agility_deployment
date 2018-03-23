
# Agility

  
## Documentation

Use http://editor.swagger.io

[API documentation\](api.yaml)

### What i need?

1) Docker
2) Docker-compose
3) Node v9.8.0

### How to run?

You will need configure your *.env* first file and go to huge. Bellow you will find how to get the *refresh_token*, *client_id*, *client_secret* and how to create your *.env* file

#### Production
```
docker-compose up -d
```

#### Developer
```
docker run -d -p 9000:27017 mongo
npm run debug_local
```

  

## Bitbucket

  
### API

https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories

  

### Create oauth configuration

Go to Bitbucket Settings > OAuth > Add Consumer

After creation save both key and secret

  

### Authorization

  

Go to https://bitbucket.org/site/oauth2/authorize?response\_type=code&client\_id={key from oauth}

  

Give permission to access you account.

Recover code parameter from authorization response

  

### Access Token

  

Encode your key and secret with base64 {key}:{secret}

```

curl -v POST https://bitbucket.org/site/oauth2/access\_token -H'Authorization: Basic {key\_and\_scret\_base64\_encoded}' -d'grant\_type=authorization\_code' -d'code={code\_from_authorization}'

```

  

\### Refresh Access Code

  

When you genenerate the access token you also get the refresh code. Save it so you can get another access code since it just last 1 hour.

```

curl -X POST -H'Authorization: Basic {key\_and\_scret\_base64\_encoded}' https://bitbucket.org/site/oauth2/access\_token -d grant\_type=refresh\_token -d refresh\_token={refresh_token}

```

  

## Application

  

### Configure Environment

To configure the environment you will need create the *.env* file in root folder

Type this command in your terminal:
```
touch .env
```

Copy the next text the paste in *.env*, replace for your respective keys

```
CLIENT_ID={YOUR ID FROM BITBUCKET API}
CLIENT_SECRET={YOUR KEY FROM BITBUCKET API}
REFRESH_TOKEN={YOUR REFRESH TOKEN FROM BITBUCKET API}
MONGODB=mongodb://mongodb/agility
```
  

### Debug Mode
In *package.json* change the *debug_local* and debug_remote keys for your respective keys from bitbucket.

Sample:
```
...
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "debug_local":"CLIENT_ID={CLIENT_ID} CLIENT_SECRET={CLIENT_SECRET} REFRESH_TOKEN={REFRESH_TOKEN} MONGODB=mongodb://{your_ip}:{mongodb_port}/agility nodemon index.js",
    "debug_remote":"CLIENT_ID={CLIENT_ID} CLIENT_SECRET={CLIENT_SECRET} REFRESH_TOKEN={REFRESH_TOKEN} MONGODB=mongodb://{your_ip}:{mongodb_port}/agility nodemon index.js",
    "start": "node index.js"
  },
...
```