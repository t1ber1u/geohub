FROM node:22-slim

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* vars are inlined at build time, so the key must be present during `yarn build`
ARG NEXT_PUBLIC_GOOGLE_API_KEY
ENV NEXT_PUBLIC_GOOGLE_API_KEY=$NEXT_PUBLIC_GOOGLE_API_KEY

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]