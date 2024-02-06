BUILD=latest

BUILD_LATEST=$(git rev-list HEAD --count)
BUILD_CONFIG=$([ "$BUILD" == "latest" ] && echo $BUILD_LATEST || echo $BUILD)
for i in $(eval echo {0..$((BUILD_LATEST-BUILD_CONFIG))})
do
  BUILD=$(git rev-list HEAD~$i --count)
  if [ "$BUILD" -le "$BUILD_CONFIG" ]; then
    git reset --hard $(git rev-list HEAD~$i -n1); break
  fi
done