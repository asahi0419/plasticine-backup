#!/bin/sh

# ==============================================================================
echo "<<<<< Extensions [Clone]"
# ------------------------------------------------------------------------------

GIT_USER=oauth
GIT_PASS=wkfyce_xQuqD8d4gFRmu

CURR_DIR=$(cd `dirname $0` && pwd)
ROOT_DIR=$CURR_DIR/../..

GIT=https://$GIT_USER:$GIT_PASS@repo.networktechnologies.online/nasc/streamline-v2/extensions

function process {
  git clone --single-branch --branch develop $GIT/$1.git
}

mkdir -p $ROOT_DIR/extensions/plugins/list
cd $ROOT_DIR/extensions/plugins/list

process plugin_telegram
process plugin_inventory
process plugin_odbc
process plugin_fts
process plugin_sso_server
process plugin_psql
process plugin_firebase
