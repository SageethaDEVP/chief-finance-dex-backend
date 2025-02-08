FROM node:18.16.0-alpine AS base

# RUN npm i -g pnpm

FROM base AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build
# RUN npm prune --prod

FROM base AS deploy

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules

CMD [ "node", "dist/src/main.js" ]