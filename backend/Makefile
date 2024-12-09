VERSION=v1
DOCKERUSER=rondon69

build:
	docker build --platform=linux/amd64 -f Dockerfile -t backend:${VERSION} .

push:
	docker tag backend:${VERSION} $(DOCKERUSER)/backend:$(VERSION)
	docker push $(DOCKERUSER)/backend:$(VERSION)