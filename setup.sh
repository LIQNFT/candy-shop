#!/usr/bin/env bash
SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# install pkgs in root
yarn
# install and build pkgs in core/types
cd core/types
yarn
yarn build
# if first argument has --link-build, using symbolic link
if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mCreate link in core/types\033[m"
    yarn link
fi

cd $SCRIPTPATH
# install and build pkgs in core/sdk
cd core/sdk
yarn
yarn build
# if first argument has --link-build, using symbolic link
if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mCreate link in core/sdk\033[m"
    yarn link @liqnft/candy-shop-types
    yarn link
fi

cd $SCRIPTPATH
# install and build pkgs in core/ui
cd core/ui
yarn

if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mLink core/ui modules to core/sdk\033[m"
    yarn link @liqnft/candy-shop-types
    yarn link @liqnft/candy-shop-sdk
fi
yarn build

# build pkgs for example
cd $SCRIPTPATH
yarn build