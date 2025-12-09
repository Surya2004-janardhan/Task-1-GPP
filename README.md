# Secure Authentication Microservice

A Node.js Express microservice implementing RSA PKI-based seed decryption and TOTP 2FA authentication.

## Features

- 🔐 RSA 4096-bit key pair generation
- 🔑 Secure seed decryption using OAEP padding
- ⏰ TOTP code generation and verification (RFC 6238)
- 🐳 Docker containerization with multi-stage build
- 🔄 Automated seed refresh via cron job
- 🛡️ Security best practices (non-root user, minimal image)

## API Endpoints

### POST /decrypt-seed

Decrypts an RSA-encrypted seed and stores it persistently.

```json
{
  "encrypted_seed": "base64-encoded-ciphertext"
}
```

### GET /generate-2fa

Generates current TOTP code and validity period.

```json
{
  "code": "123456",
  "valid_for": 25
}
```

### POST /verify-2fa

Verifies a TOTP code with ±1 window tolerance.

```json
{
  "code": "123456"
}
```

### GET /health

Health check endpoint.

```json
{
  "status": "healthy",
  "timestamp": "2025-12-09T..."
}
```

## Project Structure

```
Task-1-GPP/
├── app.js                 # Main Express server
├── util/                  # Utility functions
│   ├── crypto-utils.js    # RSA encryption/decryption/signing
│   ├── totp-utils.js      # TOTP generation/verification
│   ├── generate-keys.js   # Key pair generation
│   ├── request-seed.js    # API seed request
│   └── test-decrypt.js    # Decryption testing
├── keys/                  # Cryptographic keys (committed for demo)
│   ├── student_private.pem
│   ├── student_public.pem
│   └── instructor_public.pem
├── data/                  # Decrypted seed storage
│   └── seed.txt
├── Dockerfile             # Multi-stage container build
├── docker-compose.yml     # Container orchestration
├── refresh-seed.sh        # Cron job script
├── start.sh               # Container startup script
├── package.json
├── .gitignore
└── .gitattributes
```

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Generate RSA key pair
node util/generate-keys.js

# Request encrypted seed from instructor API
node util/request-seed.js

# Test decryption
node util/test-decrypt.js

# Start server
node app.js
```

### Testing Endpoints

```bash
# Health check
curl http://localhost:8080/health

# Generate TOTP code
curl http://localhost:8080/generate-2fa

# Verify TOTP code
curl -X POST http://localhost:8080/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'

# Decrypt seed
curl -X POST http://localhost:8080/decrypt-seed \
  -H "Content-Type: application/json" \
  -d '{"encrypted_seed":"..."}'
```

## Docker Deployment

### Prerequisites

- Docker
- Docker Compose

### Build and Run

```bash
# Build and start containers
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Cron Job

The container includes an automated cron job that refreshes the seed every 24 hours at 2 AM. The cron job:

1. Requests new encrypted seed from instructor API
2. Calls the `/decrypt-seed` endpoint to decrypt and store it
3. Logs all operations to `/app/logs/cron.log`

### Volumes

- `keys/`: Persistent storage for RSA keys
- `data/`: Persistent storage for decrypted seed
- `logs/`: Application and cron logs

## Security Features

- 🔒 RSA 4096-bit keys with OAEP padding
- 👤 Non-root container user
- 🐳 Minimal Alpine Linux base image
- 🔐 Sensitive files excluded from Git (except for demo)
- ⏰ TOTP with time window tolerance
- 🩺 Health checks and monitoring

## Configuration

Environment variables:

- `NODE_ENV`: Set to `production` in Docker

Cron schedule (in Dockerfile):

- `0 2 * * *`: Daily at 2 AM

## License

This project is for educational purposes.
