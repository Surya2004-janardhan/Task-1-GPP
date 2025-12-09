#!/bin/sh

echo "$(date): Starting seed refresh..."

node util/request-seed.js

if [ $? -eq 0 ]; then
    echo "$(date): Seed request successful"

    ENCRYPTED_SEED=$(cat keys/encrypted_seed.txt)

    echo "$(date): Decrypting seed..."
    curl -X POST http://localhost:8080/decrypt-seed \
         -H "Content-Type: application/json" \
         -d "{\"encrypted_seed\":\"$ENCRYPTED_SEED\"}" \
         --max-time 30

    if [ $? -eq 0 ]; then
        echo "$(date): Seed refresh completed successfully"
    else
        echo "$(date): ERROR: Failed to decrypt seed"
        exit 1
    fi
else
    echo "$(date): ERROR: Failed to request new seed"
    exit 1
fi

echo "$(date): Seed refresh finished"