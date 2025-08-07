// Fix script for Prisma query issue
const fs = require('fs');

console.log('🔧 Fixing Prisma query in server-fixed.js...');

// Read server file via SSH and fix locally, then upload
const fixScript = `
ssh root@148.230.87.198 "cat /var/www/marvera/backend/server-fixed.js" > server_temp.js

# Replace the problematic Prisma query
sed -i 's/{ name: { equals: category, mode: '"'"'insensitive'"'"' } }/{ name: category.toLowerCase() }/g' server_temp.js

# Also need to update to use contains instead of equals for case insensitive search
sed -i 's/name: category.toLowerCase()/name: { contains: category, mode: "insensitive" }/g' server_temp.js

# Actually, let's use a different approach - convert to lowercase in the query
`;

console.log('Script created. Now we need to fix the actual server file...');
