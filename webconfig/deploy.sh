#!/usr/bin/bash
# docs https://cloud.google.com/sdk/gcloud-app
if [[ $(uname -n) == "minos" ]]
then
    PROJECT="deductive-team-792"
else
    PROJECT="diesel-ability-711"
fi

echo "Deploy to $PROJECT"
gcloud preview app deploy --project $PROJECT gae-root
