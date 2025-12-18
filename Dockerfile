FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine

RUN apk add --no-cache dcron curl su-exec

RUN addgroup -g 1001 -S appgroup && \
  adduser -S appuser -u 1001 -G appgroup

ENV TZ=UTC

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN mkdir -p keys data logs cron

RUN chmod +x refresh-seed.sh start.sh

RUN chown -R appuser:appgroup /app

RUN echo "* * * * * /usr/local/bin/node /app/util/log-2fa.js >> /app/cron/last_code.txt 2>&1" > /tmp/crontab && \
  crontab /tmp/crontab && \
  rm /tmp/crontab

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["./start.sh"]