#!/bin/bash

# Simple manual replacement
head -111 server-fixed.js > temp_server.js
cat fixed_featured_endpoint_sql.js >> temp_server.js
tail -n +112 server-fixed.js >> temp_server.js
mv temp_server.js server-fixed.js

echo "✅ Featured products endpoint replaced with SQL version!"
