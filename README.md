## To run the app you ca use command 
```
docker compose up -d
```
it uses ports **3000** and **5432** for postgres container

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

