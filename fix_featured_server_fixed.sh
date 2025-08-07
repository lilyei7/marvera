#!/bin/bash

# Fix the server-fixed.js file instead
head -111 server-fixed.js > temp_server.js
cat fixed_featured_endpoint.js >> temp_server.js
tail -n +112 server-fixed.js >> temp_server.js
mv temp_server.js server-fixed.js

echo "✅ Featured products endpoint fixed in server-fixed.js!"
