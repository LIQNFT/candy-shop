#!/usr/bin/env bash

# This script is to publish @liqnft/candy-shop-types, @liqnft/candy-shop-sdk, @liqnft/candy-shop
# Usages:
#   1. To publish @liqnft/candy-shop-types: ./publish.sh types patch|minor
#   2. To publish @liqnft/candy-shop-sdk: ./publish.sh sdk patch|minor
#   3. To publish @liqnft/candy-shop: ./publish.sh ui patch|minor
#   e.g. `./publish.sh sdk patch` will bump patch version in core/sdk as publish.
# Note: 
#   - The publish order must be in [types -> sdk -> ui] to maintain the dependencies.
#   - In general, @liqnft/candy-shop-types will not be published individually without others along.
#   e.g. if wanna publish sdk, must publish type first and then publish sdk.


SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

CORE_TYPE_PATH=$SCRIPTPATH/core/types
CORE_SDK_PATH=$SCRIPTPATH/core/sdk
CORE_UI_PATH=$SCRIPTPATH/core/ui

TYPE_PKG_NAME=@liqnft/candy-shop-types
SDK_PKG_NAME=@liqnft/candy-shop-sdk
UI_PKG_NAME=@liqnft/candy-shop

publish_pkg () {
    if [[ $1 == "types" ]]
    then
        target_path=$CORE_TYPE_PATH
        target_pkg_name=$TYPE_PKG_NAME
    fi

    if [[ "$1" == "sdk" ]]
    then
        target_path=$CORE_SDK_PATH
        target_pkg_name=$SDK_PKG_NAME
    fi

    if [[ $1 == "ui" ]]
    then
        target_path=$CORE_UI_PATH
        target_pkg_name=$UI_PKG_NAME
    fi

    # Give the target folder and the semver to run yarn version
    bump_version "$target_path" "$2"

    echo -e "\033[36mBuild $target_pkg_name in $target_path\036[m"
    cd $target_path
    if [[ $1 == "sdk" ]]
    then
        # update version of core/types in sdk if there's new ver of @liqnft/candy-shop-types
        yarn add $TYPE_PKG_NAME@latest --exact
    fi
    if [[ $1 == "ui" ]]
    then
        # update version of core/types in ui if there's new ver of @liqnft/candy-shop-types
        yarn add $TYPE_PKG_NAME@latest --exact
        # update version of core/sdk in ui if there's new ver of @liqnft/candy-shop-sdk
        yarn add $SDK_PKG_NAME@latest --exact
    fi
    # build target
    yarn
    yarn build
    echo -e "\033[33mPublish $target_pkg_name\033[m"
    npm publish
}

bump_version() {
    echo -e "\033[33mBump versions\033[m"
    if [[ $2 == "patch" ]]
    then
        increment="--patch"
    fi
    if [[ $2 == "minor" ]]
    then
        increment="--minor"
    fi
    # Open the target folder to increase the version in pacakge.json
    cd $1
    yarn version $increment --no-git-tag-version --no-commit-hooks
}

prepare () {
    echo -e "\033[33mCleaning all node_modules and links\033[m"
    yarn clean:all
}

if [[ $1 == "sdk" || $1 == "ui" || $1 == "types" ]]
then
    pkg=$1
    if [[ $2 == "patch" || $2 == "minor" ]]
    then 
        prepare
        semver=$2
        echo -e "\033[33mPackage: core/$pkg, semver: $semver\033[m"
        publish_pkg "$pkg" "$semver"
    else
        echo -e "\033[31mNo supported sermver arugs, exit script\033[m"
        exit 0
    fi
else
    echo -e "\033[31mNo supported pkg arugs, exit script\033[m"
    exit 0
fi

