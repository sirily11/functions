FROM node:16-alpine as builder

RUN apk add --no-cache python3 py3-pip
RUN apk update && apk add make g++ && rm -rf /var/cache/apk/*

WORKDIR /app/


COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN yarn build


FROM node:16-alpine
WORKDIR /app/
# copy from build image
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next .next

EXPOSE 3000

CMD ["yarn", "start"]