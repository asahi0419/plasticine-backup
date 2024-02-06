# ==============================================================================
source $DIR_ROOT/scripts/helpers.sh
# ------------------------------------------------------------------------------

function mk_install_service {
  config=$1
  service=$2

  namespace=$(jq -r ".name" $config)
  source=$(jq -r ".services.\"$service\".source" $config)
  active=$(jq -r ".services.\"$service\".active" $config)

  if [ $active = true ]; then
    cd $DIR_ROOT/$source

    helm upgrade --install $service helm --values $config --namespace $namespace --create-namespace
  fi
}

function mk_install {
  config=$DIR_ROOT/projects/$1/config.json
  services=$(jq -r '.services | keys[]' $config)

  for s in $services; do
    mk_install_service $config $s
  done
}

function mk_uninstall {
  config=$DIR_ROOT/projects/$1/config.json
  namespace=$(jq -r ".name" $config)

  minikube kubectl -- delete --all deployments --namespace $namespace
  minikube kubectl -- delete namespaces $namespace
}
