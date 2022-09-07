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

RUN npm install -w=admin --force

RUN npm run build -w=packages

RUN npm run build -w=admin

##########################

# APP
FROM node:16-alpine as APP

ENV NODE_ENV=production

COPY --from=BUILDER /app/ .

WORKDIR /app/apps/admin

COPY --from=BUILDER /app/apps/admin/ .

RUN apk update && \
    apk upgrade && \
    apk add git

ENV DEBIAN_FRONTEND=noninteractive
ENV DISABLE_ESLINT_PLUGIN=true
ENV ESLINT_NO_DEV_ERRORS=true
ENV SKIP_PREFLIGHT_CHECK=true

LABEL author="Tolfix" maintainer="support@tolfix.com"

EXPOSE 3000

CMD ["npm", "run", "dev"]
