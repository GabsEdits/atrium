#!/bin/sh
set -eu

data_directory="${ATRIUM_DATA_DIR:-/data}"

case "$data_directory" in
  /data|/data/*) ;;
  *)
    echo "ATRIUM_DATA_DIR must be /data or a directory beneath /data in the container." >&2
    exit 1
    ;;
esac

mkdir -p "$data_directory"
chown -R deno:deno /data

exec su-exec deno deno "$@"
