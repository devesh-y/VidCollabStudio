FROM node:21 AS base
WORKDIR /usr/src/app
COPY package* .
RUN npm install
COPY . .
FROM base AS production
RUN npm run build
CMD ["npm", "run","start"]
FROM base AS development
CMD ["npm", "run","dev"]