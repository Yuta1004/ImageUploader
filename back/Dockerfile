# 1. Build app
FROM rust:1.63.0 as builder

WORKDIR /workdir

COPY ./Cargo.toml ./Cargo.toml

RUN mkdir src && \
    touch src/lib.rs && \
    cargo build --release

COPY src src

RUN cargo build --release

# 2. Build image
FROM debian:11.5-slim

WORKDIR /workdir

COPY --from=builder /workdir/target/release/iuploader_backend .

RUN apt update && \
    apt install -y --no-install-recommends ca-certificates libmariadb-dev && \
    update-ca-certificates

CMD /workdir/iuploader_backend
