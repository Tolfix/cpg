# BUILDER
FROM node:16-alpine as BUILDER

# Caching
RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN apk update && \
    apk upgrade && \
    apk add git

RUN npm install -g @types/node \
    && npm install -g typescript@4.3.5 

RUN npm i -g turbo

COPY . .

RUN npm install -w=api --force

RUN npm run build -w=packages

RUN npm run build -w=api
# RUN tsc --project apps/api/tsconfig.json

##########################

# APP
FROM node:16-alpine as APP

ENV NODE_ENV=production

COPY --from=BUILDER /app/ .

WORKDIR /app/apps/api

COPY --from=BUILDER /app/apps/api/ .

RUN apk update && \
    apk upgrade && \
    apk add git

ENV DEBIAN_FRONTEND=noninteractive

LABEL author="Tolfix" maintainer="support@tolfix.com"

ENV PLUGINS "[]"
ENV DISABLE_JSON_ERROR "true"

EXPOSE 3001

CMD [ "node", "./build/Main.js" ]