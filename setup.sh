#!/usr/bin/env bash
SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# install pkgs in root
yarn

# install and build pkgs in core/types
cd core/types
yarn
# if first argument has --link-build, using symbolic link
if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mCreate link in core/types\033[m"
    yarn link
fi
yarn build

cd $SCRIPTPATH
# install and build pkgs in core/sdk
cd core/sdk
yarn
# if first argument has --link-build, using symbolic link
if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mLink core/sdk to core/types\033[m"
    yarn link @liqnft/candy-shop-types
    echo -e "\033[33mCreate link in core/sdk\033[m"
    yarn link
fi
yarn build

cd $SCRIPTPATH
# install and build pkgs in core/ui
cd core/ui
yarn
if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mLink core/ui modules to core/sdk and core/types\033[m"
    yarn link @liqnft/candy-shop-types
    yarn link @liqnft/candy-shop-sdk
fi
yarn build

# build pkgs for example
cd $SCRIPTPATH
yarn build