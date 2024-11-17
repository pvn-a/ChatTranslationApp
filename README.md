# ChatTranslationApp
A real time chat service that provides translation to the preferred language of the user.


```sh
python3 -m venv proj
source proj/bin/activate
pip3 install -r requirements.txt

docker-compose up -d

uvicorn main:app --host 0.0.0.0 --port 6767

docker-compose down -d
docker volume rm chattranslationapp_postgres_data
```

#### postgres cmd
```sh
psql -U abc -d proj
\d users
```