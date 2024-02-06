function env_export {
  keys=$(jq '.services | to_entries | .[].key' $1)

  for key in $keys; do
    source=$(jq -r ".services["$key"] | .source" $1)
    rm -rf $DIR_ROOT/$source/.env

    port=$(jq -r ".services["$key"] | .port" $1)
    echo "SERVICE_PORT=$port" >> $DIR_ROOT/$source/.env
    echo "" >> $DIR_ROOT/$source/.env

    env_keys=$(jq "try .services["$key"] | .environment | to_entries | .[].key" $1)
    for env_key in $env_keys; do
      env_value=$(jq -r ".services["$key"] | .environment["$env_key"]" $1)
      echo "$env_key=$env_value" | sed "s/\"//g" >> $DIR_ROOT/$source/.env
    done
  done

  export APP_NAME=$(jq -r ".name" $1)
}
