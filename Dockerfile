ARG DENO_VERSION=2.9.2
FROM denoland/deno:alpine-${DENO_VERSION}

USER root
RUN apk add --no-cache su-exec \
  && mkdir -p /data \
  && chown -R deno:deno /data

WORKDIR /app
COPY deno.json deno.lock mod.ts ./
COPY src ./src
RUN deno cache mod.ts

COPY docker-entrypoint.sh /usr/local/bin/atrium-entrypoint
RUN chmod 755 /usr/local/bin/atrium-entrypoint

ENV ATRIUM_HOST=0.0.0.0
ENV ATRIUM_PORT=3000
ENV ATRIUM_DATA_DIR=/data
EXPOSE 3000
VOLUME ["/data"]

ENTRYPOINT ["/usr/local/bin/atrium-entrypoint"]
CMD ["run", "-A", "mod.ts"]
