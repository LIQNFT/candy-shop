#!/bin/bash
SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CORE_TYPE_PATH=$SCRIPTPATH/core/types
CORE_SDK_PATH=$SCRIPTPATH/core/sdk
CORE_UI_PATH=$SCRIPTPATH/core/ui

TYPE_PKG_NAME=@liqnft/candy-shop-types
SDK_PKG_NAME=@liqnft/candy-shop-sdk

# install pkgs in root
yarn

# install and build pkgs in core/types
cd $CORE_TYPE_PATH
yarn
# if first argument has --link-build, using symbolic link
if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mCreate link in core/types\033[m"
    yarn link
fi
yarn build

# install and build pkgs in core/sdk
cd $CORE_SDK_PATH
yarn
# if first argument has --link-build, using symbolic link
if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mLink core/sdk to core/types\033[m"
    yarn link $TYPE_PKG_NAME
    echo -e "\033[33mCreate link in core/sdk\033[m"
    yarn link
fi
yarn build

# install and build pkgs in core/ui
cd $CORE_UI_PATH
yarn
if [[ -n $1 && $1 == "--link-build" ]]
then
    echo -e "\033[33mLink core/ui modules to core/sdk and core/types\033[m"
    yarn link $TYPE_PKG_NAME
    yarn link $SDK_PKG_NAME
fi
yarn build

# build pkgs for example
cd $SCRIPTPATH
yarn build