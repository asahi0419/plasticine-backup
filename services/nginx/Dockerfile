FROM nginx:1.25.0-alpine

COPY etc/nginx/conf.d/default.conf.template /etc/nginx/conf.d/default.conf.template

COPY docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
