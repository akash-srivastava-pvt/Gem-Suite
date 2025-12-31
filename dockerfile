FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/node_modules ./node_modules

ENV APP_RUNTIME=cloud
ENV PORT=3000
EXPOSE 3000

CMD ["node", "apps/server/dist/server.js"]