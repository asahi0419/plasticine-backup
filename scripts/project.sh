# ==============================================================================
source $DIR_ROOT/scripts/helpers.sh
source $DIR_ROOT/scripts/env.sh
source $DIR_ROOT/scripts/workflow/db.sh
source $DIR_ROOT/scripts/workflow/dc.sh
source $DIR_ROOT/scripts/workflow/mk.sh
# ------------------------------------------------------------------------------

# function project_up_minikube() {
#   minikube start
#   minikube image load plasticine/backend
#   minikube mount $(pwd):/mnt/plasticine
#   # helm upgrade --install co2srv1 ./backend/chart/dev --namespace co2srv1
#   minikube dashboard
# }

function project_workflow_operations() {
  options=(
    "Docker Compose"
    "Minikube"
    "Database"
    ""
    "Exit"
  )

  commands=(
    "dc"
    "mk"
    "db"
    ""
    "project_select"
  )

  select_label "Select workflow:"
  select_option "${options[@]}"

  option=${commands[$?]}

  if [ $option = 'dc' ]; then
    env_export $DIR_ROOT/projects/$1/config.json $option
    # echo "$(cat $DIR_ROOT/scripts/templates/docker-compose/dev.yml)" > $DIR_ROOT/docker-compose.yml
    project_operations_dc $1 "Operate"
  fi

  if [ $option = 'db' ]; then
    # env_export $DIR_ROOT/projects/$1/config.json $option
    project_operations_db $1 "Operate"
  fi

  if [ $option = 'mk' ]; then
    env_export $DIR_ROOT/projects/$1/config.json $option
    project_operations_mk $1 "Operate"
  fi

  if [ "$option" = 'project_select' ]; then
    project_select
  fi

  if [ "$option" = '' ]; then
    project_workflow_operations
  fi
}

function project_operations_dc {
  options=(
    "Up"
    "Down"
    "Build"
    "Install"
    ""
    "Exit"
  )

  commands=(
    "dc_up"
    "dc_down"
    "dc_build"
    "dc_install"
    ""
    "project_workflow_operations"
  )

  select_label "Operate ($(tput setaf 10)$APP_NAME/$(get_git_branch)/$(get_git_build)$(tput setaf 12))"
  select_option "${options[@]}"
  option=$?

  if [ ! -z "${options[option]}" ]; then
    if [ "${commands[option]}" = "dc_up" ]; then
      project_services_select $1
    fi

    # echo "$(cat $DIR_ROOT/scripts/templates/docker-compose/dev.yml)" > $DIR_ROOT/docker-compose.yml
    validate "${commands[option]} $1"
  fi

  project_operations_dc $1 "Operate"
}

function project_operations_mk {
  options=(
    "Install"
    "Uninstall"
    ""
    "Exit"
  )

  commands=(
    "mk_install"
    "mk_uninstall"
    ""
    "project_workflow_operations"
  )

  select_label "Operate ($(tput setaf 10)$APP_NAME/$(get_git_branch)/$(get_git_build)$(tput setaf 12))"
  select_option "${options[@]}"
  option=$?

  if [ ! -z "${options[option]}" ]; then
    # if [ "${commands[option]}" = "mk_install" ]; then
    #   project_services_select $1
    # fi

    # echo "$(cat $DIR_ROOT/scripts/templates/docker-compose/dev.yml)" > $DIR_ROOT/docker-compose.yml
    validate "${commands[option]} $1"
  fi

  project_operations_mk $1 "Operate"
}

function project_operations_db {
  options=(
    "PostgreSQL"
    "MySQL"
    ""
    "Exit"
  )

  commands=(
    "project_operations_db_postgres"
    "project_operations_db_mysql"
    ""
    "project_workflow_operations"
  )

  select_label "Operate ($(tput setaf 10)$APP_NAME/$(get_git_branch)/$(get_git_build)$(tput setaf 12))"
  select_option "${options[@]}"
  option=$?

  if [ ! -z "${options[option]}" ]; then
    # echo "$(cat $DIR_ROOT/scripts/templates/docker-compose/dev.yml)" > $DIR_ROOT/docker-compose.yml
    validate "${commands[option]} $1"
  fi

  project_operations_db $1 "Operate"
}

function project_operations_db_postgres {
  options=(
    "Dump: Import"
    "Dump: Export"
    "Drop"
    "Dump: Import (Host)"
    "Dump: Export (Host)"
    "Drop (Host)"
    ""
    "Exit"
  )

  commands=(
    "db_postgres_dump_import"
    "db_postgres_dump_export"
    "db_postgres_drop"
    "db_postgres_dump_import_host"
    "db_postgres_dump_export_host"
    "db_postgres_drop_host"
    ""
    "project_workflow_operations"
  )

  select_label "Operate ($(tput setaf 10)$APP_NAME/$(get_git_branch)/$(get_git_build)$(tput setaf 12))"
  select_option "${options[@]}"
  option=$?

  if [ ! -z "${options[option]}" ]; then
    # echo "$(cat $DIR_ROOT/scripts/templates/docker-compose/dev.yml)" > $DIR_ROOT/docker-compose.yml
    validate "${commands[option]} $1"
  fi

  project_operations_db_postgres $1 "Operate"
}

function project_operations_db_mysql {
  options=(
    "Dump: Import"
    "Dump: Export"
    ""
    "Exit"
  )

  commands=(
    "db_mysql_dump_import"
    "db_mysql_dump_export"
    ""
    "project_workflow_operations"
  )

  select_label "Operate ($(tput setaf 10)$APP_NAME/$(get_git_branch)/$(get_git_build)$(tput setaf 12))"
  select_option "${options[@]}"
  option=$?

  if [ ! -z "${options[option]}" ]; then
    # echo "$(cat $DIR_ROOT/scripts/templates/docker-compose/dev.yml)" > $DIR_ROOT/docker-compose.yml
    validate "${commands[option]} $1"
  fi

  project_operations_db_mysql $1 "Operate"
}

function project_services_select {
  select_label "Select active project services:"

  services=$(jq -r '.services | to_entries | .[].key' $DIR_ROOT/projects/$1/config.json)
  active=$(jq -r '.services | to_entries | .[].value | .active' $DIR_ROOT/projects/$1/config.json)

  services_options=$(echo $services | sed "s/ /;/g")
  default=$(echo $active | sed "s/ /;/g" | sed "s/null//g")

  select_option_multiple result $services_options $default

  IFS=';' read -r -a s <<< "$services_options"
  for ((i=0; i<${#s[@]}; i++)); do
    service=${s[i]}
    active=${result[i]}

    jq ".services[\"$service\"].active = $active" $DIR_ROOT/projects/$1/config.json > "tmp" && mv "tmp" $DIR_ROOT/projects/$1/config.json
  done
}

function project_select {
  if [ -z "$(ls -A $DIR_ROOT/projects)" ]; then
    error_label "Please create at least one project"
  else
    projects=($(ls -d $DIR_ROOT/projects/* | xargs -n 1 basename))

    select_label "Select project:"
    select_option "${projects[@]}"
    project_workflow_operations ${projects[$?]}
  fi
}
