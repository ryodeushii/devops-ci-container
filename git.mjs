#!/usr/bin/env zx

console.log('INSTALL DEPENDENCIES')
await $`apk add curl git openssh docker docker-compose bash`
const fs = await import('fs')
const path = await import('path')
const BaseStstackNameackName = process.env.STACK_NAME || 'default'
const appPath = `app`;
const {
  REGISTRY_USERNAME = '',
  REGISTRY_PASSWORD = '',
  REGISTRY_DOMAIN = '',
  SSH_PRIVATE_KEY = '',
  BRANCHES = ''
} = process.env;

const branches = BRANCHES.split(',')
console.log('Configured branches: ', branches)
if (branches.length === 0) {
  throw new Error('Branches not configured :(')
}

/**
 * Check & login to registry
 */
if (!REGISTRY_USERNAME || !REGISTRY_PASSWORD || !REGISTRY_DOMAIN) {
  throw new Error('REGISTRY_USERNAME & REGISTRY_PASSWORD & REGISTRY_DOMAIN should be provided')
}
try {
  await $`docker login -u ${REGISTRY_USERNAME} -p ${REGISTRY_PASSWORD} ${REGISTRY_DOMAIN}`
} catch (e) {
  console.error(e)
}
/**
 * Check & create private key
 */
if (!SSH_PRIVATE_KEY) {
  throw new Error('SSH_PRIVATE_KEY should be provided')
}

if (!fs.existsSync('~/.ssh')) {
  await $`bash /pipeline/create_key.bash`
}

const gitUrl = process.env.GIT_URL || null
if (!gitUrl) {
  throw new Error('GIT_URL url not provided')
}

let created = false;
if (!fs.existsSync('/pipeline/app/.git')) {
  await $`git clone ${gitUrl} /pipeline/app`
  created = true
}
while (true) {
  for (const branch of branches) {
    await $`cd /pipeline/app && git checkout ${branch}`
    let changed = /TRUE/.test((await $`cd /pipeline/app && bash /pipeline/check_updates.bash`).toString()) || created
    console.log(`Changed: ${changed}\nCreated: ${created}\nTS: ${new Date()}`)
    created = false;
    if (created || changed) {
      await $`export STACK_NAME=${`${BaseStstackNameackName}_${branch}`}`
      await $`cd /pipeline/app && bash /pipeline/build.bash`
    } else {
      console.log('Not changed')
    }
  }
  await $`sleep 1m`;
}


