#!/usr/bin/env bash
mkdir -p ~/.ssh
echo -e "${SSH_PRIVATE_KEY//_/\\n}" > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts
