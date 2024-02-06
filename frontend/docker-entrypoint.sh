#!/usr/bin/env sh
set -eu

envsubst '${SERVICE_BACKEND_HOST} ${SERVICE_BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"