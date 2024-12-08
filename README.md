# ChatTranslationApp
A real time chat service that provides translation to the preferred language of the user.


```sh
python3 -m venv proj
source proj/bin/activate
pip3 install -r requirements.txt

docker-compose up -d

#frontend
cd frontend
npm start

#backend
follow steps in backend/profile/README.md



docker-compose down -d
docker volume rm chattranslationapp_postgres_data
docker volume rm chattranslationapp_mongo_data

#install node and npm using nvm - https://nodejs.org/en/download/package-manager
```

#### postgres cmd
```sh
psql -U abc -d proj
\d users
```

#### mongodb cmd
```sh
mongosh -u abc -p abc
use chat_db
show collections
```