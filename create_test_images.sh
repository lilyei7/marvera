#!/bin/bash
# Test script to create a test product with images

echo "Creating test images..."
mkdir -p /tmp/test_images

# Create test image files
echo "Creating test image 1..."
curl -s "https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Test+Image+1" -o /tmp/test_images/test1.jpg

echo "Creating test image 2..."
curl -s "https://via.placeholder.com/400x300/00FF00/FFFFFF?text=Test+Image+2" -o /tmp/test_images/test2.jpg

echo "Creating test image 3..."
curl -s "https://via.placeholder.com/400x300/0000FF/FFFFFF?text=Test+Image+3" -o /tmp/test_images/test3.jpg

echo "Test images created:"
ls -la /tmp/test_images/

echo "Now you can test uploading these images through the admin interface at:"
echo "https://marvera.mx/admin/products"
