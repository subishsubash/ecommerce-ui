FROM node:12.16.1-alpine As builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod
FROM nginx:1.17.1-alpine
COPY --from=builder /usr/src/app/dist/barclays-ecommerce-ui /usr/share/nginx/html