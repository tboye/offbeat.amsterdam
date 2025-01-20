# Prepare dependencies
# In this stage all build and production dependencies are prepared
FROM node:20-slim AS dependencies
WORKDIR /home/node
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile  --production  && \
    mv node_modules prod_node_modules && \
    yarn install --frozen-lockfile

## tests
# FROM dependencies AS test
# WORKDIR /home/node
# COPY . .
# RUN  yarn test-sqlite

## Build
## Build and create the package
FROM node:20-slim AS build
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY --from=dependencies /home/node/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN yarn build --production
RUN yarn pack --filename /tmp/package.tgz

## Production
## Use the built package
FROM node:20-slim
RUN --mount=type=bind,from=build,source=/tmp/package.tgz,target=/tmp/package.tgz \
    tar xf /tmp/package.tgz --owner node --group node -C /home/node --strip-components 1
COPY --from=dependencies /home/node/prod_node_modules /home/node/node_modules

RUN ln -s /home/node/server/cli.js /usr/local/bin/gancio

EXPOSE 13120
ENTRYPOINT ["/home/node/server/cli.js"]
