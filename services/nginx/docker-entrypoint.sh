#!/usr/bin/env sh
set -eu

envsubst '${SERVICE_BACKEND_URL} ${SERVICE_FRONTEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"