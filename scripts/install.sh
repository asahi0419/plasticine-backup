# ==============================================================================
DIR_CURR=$(cd `dirname $0` && pwd)
DIR_ROOT=$DIR_CURR/..

source $DIR_ROOT/scripts/helpers.sh
# ------------------------------------------------------------------------------

install_packages_linux() {
  echo_color "Installing $1" 12

  if [[ "$1" == "minikube" ]]; then
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
  elif [[ "$1" == "helm" ]]; then
    curl https://baltocdn.com/helm/signing.asc | sudo apt-key add -
    sudo apt-get install apt-transport-https --yes
    echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
    sudo apt-get update
    sudo apt-get install helm
  else
    echo_color "Not implemented" 3
  fi
}

install_packages_darwin() {
  echo_color "Installing $1" 12

  if brew list $1 &>/dev/null; then
    echo "✓ already installed"
  else
    brew install $1
  fi
}

install_network() {
  if [[ $(docker network inspect plasticine) ]]; then
    echo "✓ network already created"
  else
    docker network create plasticine
  fi
}

install_packages() {
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get install jq
    # install_packages_linux minikube
    # install_packages_linux helm
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo_color ""
    # install_packages_darwin minikube
    # install_packages_darwin helm
  else
    echo_color "OS Type '$OSTYPE' is not compatible" 3
  fi
}

install_husky() {
  cd $DIR_ROOT
  rm -rf .husky package.json node_modules
  npm init -y
  npx husky-init && yarn --no-lockfile
  cat frontend/scripts/pre-commit.sh > .husky/pre-commit
}

install_network
install_packages
# install_husky
