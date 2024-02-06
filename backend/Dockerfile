# syntax = docker/dockerfile:1.2

# ================================================================
# Base
# ----------------------------------------------------------------

FROM node:18.12.1-alpine3.16 as base
ENV NODE_ENV=production

# ================================================================
# Install DevOps tools
# ----------------------------------------------------------------

RUN apk add --update-cache --repository http://nl.alpinelinux.org/alpine/edge/testing && \
    apk update --no-cache && \
    apk upgrade --no-cache && \
    apk add --no-cache jq bash curl busybox-extras openssh-client mtr tcpdump openssl && \
    chmod u+s /bin/busybox

# ================================================================
# Plugin ODBC dependency
# ----------------------------------------------------------------

ENV ODBCINI=/src/plasticine/backend/extensions/plugins/list/plugin_odbc/configs/odbc.ini

# ================================================================
# Puppeteer dependency
# ----------------------------------------------------------------

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN apk add --no-cache chromium chromium-swiftshader nss freetype harfbuzz ca-certificates ttf-freefont
RUN wget https://github.com/todylu/monaco.ttf/raw/master/monaco.ttf && \
    mkdir -p /usr/share/fonts/monaco && \
    mv monaco.ttf /usr/share/fonts/monaco && \
    fc-cache -f

# ================================================================
# pdf2pic dependency
# ----------------------------------------------------------------

RUN apk add --no-cache ghostscript graphicsmagick

# ================================================================
# Build
# ----------------------------------------------------------------

FROM base as builder
WORKDIR /src/plasticine/backend
COPY . .
RUN yarn install
# TODO: remove dev dependencies extra install
RUN yarn add -D esbuild@0.17.18 @babel/cli@7.21.5 @babel/preset-env@7.21.5 babel-plugin-module-resolver@5.0.0 babel-plugin-transform-import-meta@2.2.0
RUN --mount=type=secret,id=SW_EXPIRE_DATE ./scripts/code/set-expiration.sh
RUN yarn build
RUN yarn install --production && yarn run extensions:install

# ================================================================
# Finalize
# ----------------------------------------------------------------

FROM base as final
WORKDIR /src/plasticine/backend

COPY --from=builder --chown=node /src/plasticine/backend/dist/assets/fa-icons.js /src/plasticine/backend/assets/fa-icons.js
COPY --from=builder --chown=node /src/plasticine/backend/dist/data-layer /src/plasticine/backend/data-layer
COPY --from=builder --chown=node /src/plasticine/backend/dist/business /src/plasticine/backend/business
COPY --from=builder --chown=node /src/plasticine/backend/dist/extensions /src/plasticine/backend/extensions
COPY --from=builder --chown=node /src/plasticine/backend/dist/presentation/server/api/commands/load /src/plasticine/backend/presentation/server/api/commands/load
COPY --from=builder --chown=node /src/plasticine/backend/dist/presentation/server/passport /src/plasticine/backend/presentation/server/passport
COPY --from=builder --chown=node /src/plasticine/backend/dist/presentation/server/wss.js /src/plasticine/backend/presentation/server/wss.js
COPY --from=builder --chown=node /src/plasticine/backend/dist/presentation/shared/cache /src/plasticine/backend/presentation/shared/cache

COPY --from=builder --chown=node /src/plasticine/backend/assets/document-templates /src/plasticine/backend/assets/document-templates
COPY --from=builder --chown=node /src/plasticine/backend/presentation/shared/keys /src/plasticine/backend/presentation/shared/keys
COPY --from=builder --chown=node /src/plasticine/backend/packages /src/plasticine/backend/packages
COPY --from=builder --chown=node /src/plasticine/backend/node_modules /src/plasticine/backend/node_modules
COPY --from=builder --chown=node /src/plasticine/backend/index.jsc /src/plasticine/backend/index.jsc
COPY --from=builder --chown=node /src/plasticine/backend/package.cjs.json /src/plasticine/backend/package.json

USER node
EXPOSE 8080
CMD [ "yarn", "run", "server:start:production" ]
