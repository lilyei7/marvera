#!/bin/bash

# Find where the current endpoint is and replace it
grep -n "// FIXED FEATURED PRODUCTS ENDPOINT" server-fixed.js
start_line=$(grep -n "// FIXED FEATURED PRODUCTS ENDPOINT" server-fixed.js | cut -d: -f1)
end_line=$((start_line + 69))  # Assuming about 70 lines for the endpoint

echo "Replacing lines $start_line to $end_line"

# Create backup
cp server-fixed.js server-fixed.js.backup.$(date +%s)

# Replace the endpoint
head -$((start_line - 1)) server-fixed.js > temp_server.js
cat fixed_featured_endpoint_v2.js >> temp_server.js
tail -n +$((end_line + 1)) server-fixed.js >> temp_server.js
mv temp_server.js server-fixed.js

echo "✅ Featured products endpoint updated with local Prisma!"
