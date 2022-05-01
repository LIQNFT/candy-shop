#!/usr/bin/env bash

# This script will execute yarn link to allow core/ui using the local core/sdk package.
# Make sure you've built the core/sdk before linking.
# Workspace symbolic links will be cleared after running yarn clean:all
# It will not clear the link of package you've provide, we just need to re-excute the symbolic link in consumer package. 
# https://classic.yarnpkg.com/en/docs/cli/link

SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Link core/sdk
cd core/sdk
yarn link

# Link core/sdk in core/ui
cd $SCRIPTPATH
cd core/ui
yarn link @liqnft/candy-shop-sdk

cd $SCRIPTPATH
echo 'Symbolic links ready'