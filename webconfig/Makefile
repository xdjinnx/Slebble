UNAME := $(shell uname -n)

ifeq ($(UNAME),minos)
    PROJECT := "deductive-team-792"
else
    PROJECT := "diesel-ability-711"
endif

all:
	@echo "woop"

.PHONY: run
run:
	gcloud preview app run gae-root/app.yaml

.PHONY: deploy
deploy:
	# docs https://cloud.google.com/sdk/gcloud-app
	@echo Deploy to $(PROJECT)
	gcloud preview app deploy --project $(PROJECT) gae-root/app.yaml
