FROM ejabberd/mix as builder
ARG VERSION
ENV VERSION=${VERSION:-latest} \
    MIX_ENV=prod
LABEL maintainer="ProcessOne <contact@process-one.net>" \
    product="Ejabberd Community Server builder"

# Get ejabberd sources, dependencies, configuration
RUN git clone https://github.com/processone/ejabberd.git
WORKDIR /ejabberd
COPY vars.config .
COPY rel/*exs rel/
RUN git checkout ${VERSION/latest/HEAD} \
    && mix deps.get \
    && (cd deps/eimp; ./configure)

# Compile
RUN mix do compile, distillery.init, distillery.release --env=prod

# Prepare runtime environment
RUN mkdir runtime \
    && tar -C runtime -zxf _build/prod/rel/ejabberd/releases/*/ejabberd.tar.gz \
    && cd runtime \
    && cp releases/*/start.boot bin \
    && echo 'beam_lib:strip_files(filelib:wildcard("lib/*/ebin/*beam")), init:stop().' | erts*/bin/erl -boot start_clean >/dev/null \
    && mv erts*/bin/* bin \
    && rm -rf releases erts* bin/*src bin/dialyzer bin/typer \
    && rm bin/ejabberd bin/ejabberd.bat \
    && cp -r /ejabberd/sql lib/ejabberd-*/priv

# Runtime container
FROM alpine:3.11
ARG VERSION
ARG VCS_REF
ARG BUILD_DATE
ENV TERM=xterm \
    LC_ALL=C.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8 \
    REPLACE_OS_VARS=true \
    HOME=/home/ejabberd \
    VERSION=${VERSION:-latest}
LABEL maintainer="ProcessOne <contact@process-one.net>" \
    product="Ejabberd Community Server Official Docker Image" \
    version=$VERSION \
    org.label-schema.vcs-ref=$VCS_REF \
    org.label-schema.vcs-url="https://github.com/processone/docker-ejabberd" \
    org.label-schema.build-date=$BUILD_DATE \
    org.label-schema.name="Ejabberd Community Server Official Docker Image" \
    org.label-schema.description="Robust, Scalable and Extensible Realtime Server using XMPP, MQTT and SIP" \
    org.label-schema.url="https://www.ejabberd.im/" \
    org.label-schema.vendor="ProcessOne" \
    org.label-schema.version=$VERSION \
    org.label-schema.schema-version="1.0"

# Create directory structure and user for ejabberd
RUN addgroup ejabberd -g 9000 \
    && adduser -s /bin/sh -D -G ejabberd ejabberd -u 9000 \
    && mkdir -p /home/ejabberd/conf /home/ejabberd/database /home/ejabberd/logs /home/ejabberd/upload \
    && chown -R ejabberd:ejabberd /home/ejabberd

# Install required dependencies
RUN apk upgrade --update musl \
    && apk add \
    expat \
    freetds \
    gd \
    jpeg \
    libgd \
    libpng \
    libstdc++ \
    libwebp \
    ncurses-libs \
    openssl \
    sqlite \
    sqlite-libs \
    unixodbc \
    yaml \
    zlib \
    && ln -fs /usr/lib/libtdsodbc.so.0 /usr/lib/libtdsodbc.so \
    && rm -rf /var/cache/apk/*

RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN apk add gcc python3-dev musl-dev make
RUN python3 -m ensurepip
RUN pip3 install --upgrade pip setuptools
RUN pip3 install wheel
RUN pip3 install --no-cache-dir httptools 
RUN pip3 install --no-cache-dir uvloop
RUN pip3 install --no-cache-dir fastapi
RUN pip3 install --no-cache-dir uvicorn
RUN pip3 install --no-cache-dir requests

# Install ejabberd
WORKDIR $HOME
COPY --from=builder /ejabberd/runtime .
COPY bin/* bin/
RUN chmod 755 bin/ejabberdctl bin/ejabberdapi bin/erl
COPY --chown=ejabberd:ejabberd conf conf/
ADD --chown=ejabberd:ejabberd https://download.process-one.net/cacert.pem conf/cacert.pem

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# Setup runtime environment
USER ejabberd
VOLUME ["$HOME/database","$HOME/conf","$HOME/logs","$HOME/upload"]
EXPOSE 1883 4369-4399 5222 5269 5280 5443

COPY ./start.sh ./start.sh
COPY ./main.py ./main.py
COPY --chown=ejabberd:ejabberd ./auth.py /home/auth.py


ENTRYPOINT ["./start.sh"]
