#!/bin/bash

# This script will auto 
# 1. upgrading the @liqnft/candy-shop-types in core/sdk and @liqnft/candy-shop-sdk in core/ui if any latest.
# 2. making the commit message with updated versions of relevant packages.
#
# Usages:
#   ./make_release_commit.sh

SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CORE_UI_PATH=$SCRIPTPATH/core/ui
CORE_SDK_PATH=$SCRIPTPATH/core/sdk

TYPE_PKG_NAME=@liqnft/candy-shop-types
SDK_PKG_NAME=@liqnft/candy-shop-sdk
UI_PKG_NAME=@liqnft/candy-shop

cd $CORE_SDK_PATH
# Install core/type to latest if any update
yarn add $TYPE_PKG_NAME@latest --exact
# Get the core/type package version
type_pkg_info_arr=( $(yarn info $TYPE_PKG_NAME version) )
type_pkg_version=${type_pkg_info_arr[3]}

cd $CORE_UI_PATH
# Install core/sdk to latest if any update
yarn add $SDK_PKG_NAME@latest --exact
# Get the core/sdk package version
sdk_pkg_info_arr=( $(yarn info $SDK_PKG_NAME version) )
sdk_pkg_version=${sdk_pkg_info_arr[3]}
# Get the core/ui package version
ui_pkg_info_arr=( $(yarn info $UI_PKG_NAME version) )
ui_pkg_version=${ui_pkg_info_arr[3]}

echo -e "\033[33mCurrent Installed $TYPE_PKG_NAME version: $type_pkg_version\033[m"
echo -e "\033[33mCurrent Installed $SDK_PKG_NAME version: $sdk_pkg_version\033[m"
echo -e "\033[33mCurrent Installed $UI_PKG_NAME version: $ui_pkg_version\033[m"

git_file_changes_arr=( $(git status --porcelain) )
git_file_changes_arr_len=${#git_file_changes_arr[@]}

# Global variables
type_update=false
sdk_update=false
ui_update=false

make_commit_mgs() {
    echo -e "\033[36mcore/type bump: $type_update\033[m"
    echo -e "\033[36mcore/sdk bump: $sdk_update\033[m"
    echo -e "\033[36mcore/ui bump: $ui_update\033[m"

    cd $SCRIPTPATH
    git add .
    
    NEWLINE=$'\n'
    commit_title="Bump core "
    commit_content="${NEWLINE}"
    
    if [[ "$type_update" = true ]]
    then
        commit_title="${commit_title}[types] "
        type_msg="${NEWLINE}$TYPE_PKG_NAME -> $type_pkg_version"
        commit_content="${commit_content}${type_msg}"
    fi

    if [[ "$sdk_update" = true ]]
    then
        commit_title="${commit_title}[sdk] "
        sdk_msg="${NEWLINE}$SDK_PKG_NAME -> $sdk_pkg_version"
        commit_content="${commit_content}${sdk_msg}"
    fi

    if [[ "$ui_update" = true ]]
    then
        commit_title="${commit_title}[ui] "
        ui_msg="${NEWLINE}$UI_PKG_NAME -> $ui_pkg_version"
        commit_content="${commit_content}${ui_msg}"
    fi
    
    commit_title="${commit_title}version"
    git commit -m "${commit_title} ${commit_content}"
}

if [ $git_file_changes_arr_len -gt 0 ]
then
    echo "File changes, making commit"

    for file in "${git_file_changes_arr[@]}"
    do
        # check if file change patch contains target string
        if [[ $file == *"core/types"* ]]
        then
            type_update=true
        elif [[ $file == *"core/sdk"* ]]
        then
            sdk_update=true
        elif [[ $file == *"core/ui"* ]]
        then
            ui_update=true
        fi
    done

    if [[ "$type_update" = false && "$sdk_update" = false && "$ui_update" = false ]]
    then
        echo -e "\033[31mUnexpected file changed, abort\033[m"
        exit 0
    fi

    make_commit_mgs
else
    echo "Nothing update"
fi
