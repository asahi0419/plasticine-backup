# ==============================================================================
source $DIR_ROOT/scripts/helpers.sh
# ------------------------------------------------------------------------------

function dc_up_service {
  config=$1
  service=$2

  source=$(jq -r ".services.\"$service\".source" $config)
  source_service=$(jq -r ".services.\"$service\".service" $config)
  active=$(jq -r ".services.\"$service\".active" $config)

  if [ $source_service != null ]; then
    service=$source_service
  fi

  if [ $active = true ]; then
    if [ -z $(docker ps -q -f "name=$service*") ]; then
      cd $DIR_ROOT/$source

      docker-compose up -d --remove-orphans $service
    fi
  else
    if [ $(docker ps -q -f "name=$service*") ]; then
      cd $DIR_ROOT/$source

      docker-compose down --remove-orphans
    fi
  fi
}

function dc_up {
  config=$DIR_ROOT/projects/$1/config.json
  services=$(jq -r '.services | keys[]' $config)

  for s in $services; do
    needs=$(jq -r ".services.\"$s\".needs | values[]" $config)

    for need in $needs; do
      dc_up_service $config $need
    done

    dc_up_service $config $s
  done
}

function dc_down {
  containers=$(docker ps -aqf 'network=plasticine')

  docker stop $containers
  docker rm $containers
}

function dc_build {
  config=$DIR_ROOT/projects/$1/config.json
  services=($(jq -r '.services | to_entries | .[].key' $DIR_ROOT/projects/$1/config.json))

  select_label "Select service:"
  select_option "${services[@]}"
  service="${services[$?]}"
  source=$(jq -r ".services.\"$service\".source" $config)
  cd $DIR_ROOT/$source
  source_service=$(jq -r ".services.\"$service\".service" $config)
  docker-compose build --no-cache $source_service
}

function dc_install {
  config=$DIR_ROOT/projects/$1/config.json
  services=($(jq -r '.services | to_entries | .[].key' $DIR_ROOT/projects/$1/config.json))

  select_label "Select service:"
  select_option "${services[@]}"
  service="${services[$?]}"
  source=$(jq -r ".services.\"$service\".source" $config)
  cd $DIR_ROOT/$source
  source_service=$(jq -r ".services.\"$service\".service" $config)
  docker-compose run $source_service yarn install
  docker-compose rm -f
}
