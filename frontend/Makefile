VERSION=v1
DOCKERUSER=rondon69

build:
	docker build --platform=linux/amd64 -f Dockerfile -t frontend:${VERSION} .

push:
	docker tag frontend:${VERSION} $(DOCKERUSER)/frontend:$(VERSION)
	docker push $(DOCKERUSER)/frontend:$(VERSION)