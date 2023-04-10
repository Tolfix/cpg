# BUILDER
FROM node:16-alpine as BUILDER

# Caching
RUN apk add --no-cache libc6-compat

RUN apk update && \
    apk upgrade && \
    apk add git

RUN npm install -g @types/node \
    && npm install -g typescript@4.3.5 

WORKDIR /app

RUN npm i -g turbo

COPY . .

RUN turbo prune --scope=api --docker

##########################

FROM node:16-alpine as INSTALLER
RUN apk add --no-cache libc6-compat
RUN apk update
RUN apk add git
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=BUILDER /app/out/json/ .
# COPY --from=BUILDER /app/out/package-lock.json ./package-lock.json

RUN npm i --force

COPY --from=builder /app/out/full/ .

COPY turbo.json turbo.json

RUN npm run build --filter=api...

##########################

# APP
FROM node:16-alpine as APP

RUN apk add --no-cache libc6-compat
RUN apk update

ENV NODE_ENV=production

WORKDIR /app

# Currently idk how to get this to work, so copying root ig? with some files ignored from pruning at least.
COPY --from=INSTALLER /app .

WORKDIR /app/apps/api

RUN apk update && \
    apk upgrade && \
    apk add git

ENV DEBIAN_FRONTEND=noninteractive

LABEL author="Tolfix" maintainer="support@tolfix.com"

ENV PLUGINS "[]"
ENV DISABLE_JSON_ERROR "true"

EXPOSE 3001

CMD ["node", "./build/Main.js"]