#!/usr/bin/env bash
# Build编译入口脚本

export NODE_ENV=production
export PATH=$NODEJS_BIN_LATEST:$PATH

echo "node $(node -v)"
echo echo "npm v$(npm -v)"

echo "Install npm dependencies"
npm install --production=false --registry=http://registry.npm.baidu-int.com

npm test

echo "Done"
