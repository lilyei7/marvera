#!/bin/bash
# Fix Prisma query in server-fixed.js

echo "🔧 Fixing Prisma query..."

# Create a temporary fixed version
cat > /tmp/prisma_fix.txt << 'EOF'
    let categoryRecord = await prisma.category.findFirst({
      where: {
        OR: [
          { name: category },
          { slug: categorySlug }
        ]
      }
    });
EOF

# Replace the problematic query
sed -i '/let categoryRecord = await prisma.category.findFirst({/,/});/{
  /let categoryRecord = await prisma.category.findFirst({/r /tmp/prisma_fix.txt
  /let categoryRecord = await prisma.category.findFirst({/,/});/d
}' /var/www/marvera/backend/server-fixed.js

echo "✅ Prisma query fixed"

# Verify the fix
echo "🔍 Checking fixed query:"
sed -n '/let categoryRecord = await prisma.category.findFirst/,/});/p' /var/www/marvera/backend/server-fixed.js
