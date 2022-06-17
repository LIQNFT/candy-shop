#!/usr/bin/env bash
SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# install pkgs in root
yarn

# install and build pkgs in core/types
cd core/types
yarn
yarn build

cd $SCRIPTPATH
# install and build pkgs in core/sdk
cd core/sdk
yarn
yarn build

cd $SCRIPTPATH
# install and build pkgs in core/ui
cd core/ui
yarn
yarn build

# build pkgs for example
cd $SCRIPTPATH
yarn build