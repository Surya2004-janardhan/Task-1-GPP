FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine

RUN apk add --no-cache dcron curl tzdata

ENV TZ=UTC

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Create volume mount points at root level (as required)
RUN mkdir -p /data /cron keys && \
  chmod 755 /data /cron

# Set up cron job - output to /cron/last_code.txt
RUN echo "* * * * * cd /app && /usr/local/bin/node /app/util/log-2fa.js >> /cron/last_code.txt 2>&1" > /etc/crontabs/root

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["/bin/sh", "-c", "crond && node app.js"]