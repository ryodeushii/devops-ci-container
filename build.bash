#!/usr/bin/env bash
cd /pipeline/app
git pull
export CI_TAG=$(git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3)
docker-compose build
docker-compose push
echo "Deploying stack ${STACK_NAME:-default}"
docker stack deploy --with-registry-auth -c docker-compose.yml ${STACK_NAME:-default}