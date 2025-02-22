## To run the app you ca use command 
```
docker compose up -d
```
it uses ports **3000** and **5432** for postgres container

# You can run it on your local machine, but don't forget to create db with user, password and to change the db config **src/database/config.ts**

## Run it via npm in dev mode
```
npm run dev
```

## Run it via npm in production mode
```
npm run build && node dist/app.js
```

## Some notes
 - I'm using **any** type in error mddw just to save my time
 - I didn't add .env file to .gitignore just for your convenience
 - Anyway I tried to follow some understandable and clean structure
 - And pay attention that I'm using **PATCH** method to update the balance

