DIR_TARGET=$(pwd)/$1
DIR_SCAN=$(pwd)/scan
BRANCH=$(git rev-parse --abbrev-ref HEAD)

mkdir -p $DIR_SCAN
cd $DIR_TARGET

yarn audit --groups=dependencies > $DIR_SCAN/yarn.audit.$BRANCH.log
snyk test > $DIR_SCAN/snyk.$BRANCH.log
trivy image plasticine/$1:$BRANCH > $DIR_SCAN/trivy.$BRANCH.log