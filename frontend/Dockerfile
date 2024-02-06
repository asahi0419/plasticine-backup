FROM node:18.12.1-alpine3.16 AS base
WORKDIR /src/plasticine/frontend

FROM base AS builder
COPY frontend .
COPY .git .git
RUN apk add git && yarn install && yarn build

FROM nginxinc/nginx-unprivileged:1.25-alpine
COPY --from=builder --chown=nginx /src/plasticine/frontend/dist /usr/share/nginx/html
COPY --from=builder --chown=nginx /src/plasticine/frontend/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY --from=builder --chown=nginx /src/plasticine/frontend/docker-entrypoint.sh /
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
