#!/bin/bash

# Insert the fixed endpoint at line 88 (after the comment)
head -88 production-server.js > temp_server.js
cat fixed_featured_endpoint.js >> temp_server.js
tail -n +89 production-server.js >> temp_server.js
mv temp_server.js production-server.js

echo "✅ Featured products endpoint fixed!"
