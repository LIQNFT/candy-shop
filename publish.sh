#!/usr/bin/env bash
SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [[ "$*" == *"sdk"* || "$*" == *"ui"* || "$*" == *"types"* ]]
then
    echo -e "\033[33mBump versions\033[m"
    ts-node bump.ts $@
fi

if [[ "$*" == *"types"* ]]
then
    echo -e "\033[33mClean build core/types\033[m"
    cd $SCRIPTPATH
    cd core/types
    rm -rf node_modules
    yarn
    yarn build

    echo -e "\033[33mPublish core/ui\033[m"
    npm publish
fi

if [[ "$*" == *"sdk"* ]]
then
    echo -e "\033[33mClean build core/sdk\033[m"
    cd $SCRIPTPATH
    cd core/sdk
    rm -rf node_modules
    yarn unlink @liqnft/candy-shop-types
    yarn
    yarn build

    echo -e "\033[33mPublish core/sdk\033[m"
    npm publish
fi

if [[ "$*" == *"ui"* ]]
then
    echo -e "\033[33mClean build core/ui\033[m"
    cd $SCRIPTPATH
    cd core/ui
    rm -rf node_modules
    yarn unlink @liqnft/candy-shop-sdk
    yarn unlink @liqnft/candy-shop-types
    yarn
    yarn build

    echo -e "\033[33mPublish core/ui\033[m"
    npm publish
fi
