# ==============================================================================
source $DIR_ROOT/scripts/helpers.sh
# ------------------------------------------------------------------------------

function db_postgres_create {
  docker exec -i $(get_db_container postgres) psql -U $(get_db_user $1) -c "create database $(get_db_name $1)"
}

function db_postgres_create_host {
  psql -U $(get_db_user $1) -c "create database $(get_db_name $1)"
}

function db_postgres_drop {
  docker-compose -f $DIR_ROOT/services/$(get_db_host $1)/docker-compose.yml up -d

  docker exec -i $(get_db_container postgres) psql -U $(get_db_user $1) -c "SELECT 1 FROM pg_roles WHERE rolname='postgres'" | grep -q 1 ||
  docker exec -i $(get_db_container postgres) psql -U $(get_db_user $1) -c "CREATE USER postgres SUPERUSER"
  docker exec -i $(get_db_container postgres) psql -U $(get_db_user $1) -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();"

  docker exec -i $(get_db_container postgres) psql -U $(get_db_user $1) -c "drop database if exists $(get_db_name $1)"
}

function db_postgres_drop_host {
  psql -U $(get_db_user $1) -c "SELECT 1 FROM pg_roles WHERE rolname='postgres'" | grep -q 1 ||
  psql -U $(get_db_user $1) -c "CREATE USER postgres SUPERUSER"
  psql -U $(get_db_user $1) -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();"

  psql -U $(get_db_user $1) -c "drop database if exists $(get_db_name $1)"
}

function db_postgres_dump_import {
  if [ -z "$(ls -A $DIR_ROOT/projects/$1/dumps)" ]; then
    error_label "No dumps to import"
    project_operations_db $1 "Operate"
  else
    dumps=($(ls -d $DIR_ROOT/projects/$1/dumps/* | xargs -n 1 basename))
    select_label "Select dump to import:"
    select_option "${dumps[@]}"
    dump=${dumps[$?]}

    db_postgres_drop $1
    db_postgres_create $1

    if [ "$(uname)" == "Darwin" ]; then
      gzcat $DIR_ROOT/projects/$1/dumps/$dump | docker exec -i $(get_db_container postgres) psql -U $(get_db_user $1) -d $(get_db_name $1)
    else
      zcat $DIR_ROOT/projects/$1/dumps/$dump | docker exec -i $(get_db_container postgres) psql -U $(get_db_user $1) -d $(get_db_name $1)
    fi
  fi
}

function db_postgres_dump_import_host {
  if [ -z "$(ls -A $DIR_ROOT/projects/$1/dumps)" ]; then
    error_label "No dumps to import"
    project_operations_db $1 "Operate"
  else
    dumps=($(ls -d $DIR_ROOT/projects/$1/dumps/* | xargs -n 1 basename))
    select_label "Select dump to import:"
    select_option "${dumps[@]}"
    dump=${dumps[$?]}

    db_postgres_drop_host $1
    db_postgres_create_host $1

    if [ "$(uname)" == "Darwin" ]; then
      gzcat $DIR_ROOT/projects/$1/dumps/$dump | psql -U $(get_db_user $1) -d $(get_db_name $1)
    else
      zcat $DIR_ROOT/projects/$1/dumps/$dump | psql -U $(get_db_user $1) -d $(get_db_name $1)
    fi
  fi
}

function db_postgres_dump_export {
  docker-compose -f $DIR_ROOT/services/$(get_db_host $1)/docker-compose.yml up -d
  name="local-$(get_git_branch)-build-$(get_git_build)-$(date +%y%m%d-%H%M%S).sql.gz"

  sh -c "docker exec -i $(get_db_container postgres) pg_dump --no-owner -U $(get_db_user $1) $(get_db_name $1) | gzip >> $DIR_ROOT/projects/$1/dumps/$name"
}

function db_postgres_dump_export_host {
  name="local-$(get_git_branch)-build-$(get_git_build)-$(date +%y%m%d-%H%M%S).sql.gz"

  sh -c "pg_dump --no-owner -U $(get_db_user $1) $(get_db_name $1) | gzip >> $DIR_ROOT/projects/$1/dumps/$name"
}

function db_mysql_create {
  echo "create database $(get_db_name $1)" | docker exec -i $(get_db_container mysql) /usr/bin/mysql --verbose -u $(get_db_user $1) --password=$(get_db_pass $1)
}

function db_mysql_drop {
  echo "drop database if exists $(get_db_name $1)" | docker exec -i $(get_db_container mysql) /usr/bin/mysql --verbose -u $(get_db_user $1) --password=$(get_db_pass $1)
}

function db_mysql_dump_import {
  if [ -z "$(ls -A $DIR_ROOT/projects/$1/dumps)" ]; then
    error_label "No dumps to import"
    project_operations_db $1 "Operate"
  else
    dumps=($(ls -d $DIR_ROOT/projects/$1/dumps/* | xargs -n 1 basename))
    select_label "Select dump to import:"
    select_option "${dumps[@]}"
    dump=${dumps[$?]}

    db_mysql_drop $1
    db_mysql_create $1

    if [ "$(uname)" == "Darwin" ]; then
      gzcat $DIR_ROOT/projects/$1/dumps/$dump | docker exec -i $(get_db_container mysql) /usr/bin/mysql --verbose -u$(get_db_user $1) -p$DB_PASSWORD $(get_db_name $1)
    else
      zcat $DIR_ROOT/projects/$1/dumps/$dump | docker exec -i $(get_db_container mysql) /usr/bin/mysql --verbose -u$(get_db_user $1) -p$DB_PASSWORD $(get_db_name $1)
    fi
  fi
}

function db_mysql_dump_export {
  docker-compose -f $DIR_ROOT/services/$(get_db_host $1)/docker-compose.yml up -d
  name="local-$(get_git_branch)-build-$(get_git_build)-$(date +%y%m%d-%H:%M:%S).sql.gz"

  sh -c "docker exec -i $(get_db_container mysql) mysqldump -u$(get_db_user $1) -pplasticine_password $(get_db_name $1) | gzip >> $DIR_ROOT/projects/$1/dumps/$name"
}