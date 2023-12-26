FROM node:21 as base
WORKDIR /usr/src/app
COPY package* .
RUN npm install
COPY . .
FROM base as production
RUN npm run build
CMD ["npm", "run","start"]
FROM base as development
CMD ["npm", "run","dev"]