FROM node:20 as build-stage

WORKDIR /usr/src/app

COPY . .

RUN npm ci

ENV VITE_BACKEND_URL="http://localhost:8080/api/"

CMD ["npm", "run", "dev", "--", "--host"]
