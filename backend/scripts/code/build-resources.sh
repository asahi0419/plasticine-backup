#!/bin/sh

CURRENT_DIR=$(cd `dirname $0` && pwd)
ROOT_DIR=$CURRENT_DIR/../..
DIST_DIR=$ROOT_DIR/dist

# prepare

rm -rf $DIST_DIR
mkdir $DIST_DIR

cp -RT extensions -d $DIST_DIR/extensions
cp -RT scripts -d $DIST_DIR/scripts

# babel builds

babel assets -d $DIST_DIR/assets --ignore '**/*.spec.js'
babel data-layer -d $DIST_DIR/data-layer --ignore '**/*.spec.js'
babel business -d $DIST_DIR/business --ignore '**/*.spec.js'
babel extensions -d $DIST_DIR/extensions --ignore '**/*.spec.js'
babel presentation -d $DIST_DIR/presentation --ignore '**/*.spec.js'

jq ".type = \"commonjs\"" $ROOT_DIR/package.json > "tmp" && mv "tmp" $ROOT_DIR/package.cjs.json
