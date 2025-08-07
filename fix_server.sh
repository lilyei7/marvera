#!/bin/bash

# Script to fix the POST route in server-fixed.js

echo "Creating temporary fix script..."

cat > /tmp/fix_server.py << 'EOF'
import re

# Read the current file
with open('/var/www/marvera/backend/server-fixed.js', 'r') as f:
    content = f.read()

# Read the new POST route
with open('/tmp/fixed-post-route.js', 'r') as f:
    new_post_route = f.read()

# Find the start and end of the current POST route
start_pattern = r"app\.post\('/api/admin/products', upload\.array\('images', 7\), async \(req, res\) => \{"
end_pattern = r"^\}\);"

# Split content into lines
lines = content.split('\n')
start_line = -1
end_line = -1

# Find start line
for i, line in enumerate(lines):
    if "app.post('/api/admin/products', upload.array('images', 7)" in line:
        start_line = i
        break

# Find end line (look for closing }); after start)
if start_line != -1:
    brace_count = 0
    for i in range(start_line, len(lines)):
        line = lines[i]
        brace_count += line.count('{')
        brace_count -= line.count('}')
        if brace_count == 0 and line.strip().endswith('});'):
            end_line = i
            break

print(f"Found POST route from line {start_line} to {end_line}")

if start_line != -1 and end_line != -1:
    # Replace the lines
    new_lines = lines[:start_line] + [new_post_route] + lines[end_line+1:]
    new_content = '\n'.join(new_lines)
    
    # Write back to file
    with open('/var/www/marvera/backend/server-fixed.js', 'w') as f:
        f.write(new_content)
    
    print("POST route replacement completed successfully!")
else:
    print("Could not find POST route boundaries")
EOF

python3 /tmp/fix_server.py
