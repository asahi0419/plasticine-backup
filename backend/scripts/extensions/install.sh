#!/bin/bash

CURR_DIR=$(cd `dirname $0` && pwd)
ROOT_DIR=$CURR_DIR/../..

PLUGINS_DIR=$ROOT_DIR/extensions/plugins/list

if [ "$(ls $PLUGINS_DIR)" ]; then
  # ==============================================================================
  echo "<<<<< Extensions - Plugins [Install system packages]"
  # ------------------------------------------------------------------------------

  for PLUGIN_DIR in "$PLUGINS_DIR"/*
  do
    if [ -d "$PLUGIN_DIR/shell" ]; then
      # ==============================================================================
      echo "Running shell: $PLUGIN_DIR"
      # ------------------------------------------------------------------------------
      sh $PLUGIN_DIR/shell/install.production.sh
    fi
  done

  # ==============================================================================
  echo "<<<<< Extensions - Plugins [Install node packages]"
  # ------------------------------------------------------------------------------

  packages=$(jq --slurp 'reduce .[] as $item ({}; . * $item) | .dependencies | to_entries | .[].key' $PLUGINS_DIR/*/package.json)
  versions=$(jq --slurp 'reduce .[] as $item ({}; . * $item) | .dependencies | to_entries | .[].value' $PLUGINS_DIR/*/package.json)

  p=($(echo "$packages" | tr ' ' '\n'))
  v=($(echo "$versions" | tr ' ' '\n'))

  for ((i = 0 ; i < ${#p[@]} ; i++ )); do
    package=${p[i]}
    version=${v[i]}

    dependencies="$dependencies $(echo $package@$version | sed "s/\"//g")"
  done

  if [ ! -z "$dependencies" ]; then
    yarn add $dependencies
  fi
fi
