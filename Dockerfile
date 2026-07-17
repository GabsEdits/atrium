ARG DENO_VERSION=2.9.2
FROM denoland/deno:alpine-${DENO_VERSION}

WORKDIR /app
COPY deno.json deno.lock mod.ts ./
COPY src ./src
RUN deno cache mod.ts

ENV ATRIUM_HOST=0.0.0.0
ENV ATRIUM_PORT=3000
ENV ATRIUM_DATA_DIR=/data
EXPOSE 3000
VOLUME ["/data"]

USER deno
CMD ["run", "-A", "mod.ts"]
