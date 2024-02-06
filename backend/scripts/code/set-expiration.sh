#!/bin/sh

CURRENT_DIR=$(cd `dirname $0` && pwd)
ROOT_DIR=$CURRENT_DIR/../..
DIST_DIR=$ROOT_DIR/dist

SW_EXPIRE_DATE=$(cat /run/secrets/SW_EXPIRE_DATE)

if [ ! -z $SW_EXPIRE_DATE ]; then
  sed -i -e "s/SW_EXPIRE_DATE/$SW_EXPIRE_DATE/" $ROOT_DIR/presentation/server/middlewares/index.js
fi