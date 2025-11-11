FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated/libquery_engine-linux-musl-openssl-3.0.x.so.node ./dist/src/generated
COPY --from=builder /app/prisma ./prisma
CMD ["npm", "start"]