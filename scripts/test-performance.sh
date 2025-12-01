#!/bin/bash

echo "🚀 Testing Performance - AuroreIA Landing"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Build Production
echo "📦 Building production..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""

# 2. Analyze bundle size
echo "📊 Analyzing bundle size..."
echo ""

# Client bundle
CLIENT_SIZE=$(du -sh .output/public/_nuxt 2>/dev/null | awk '{print $1}')
echo "  Client bundle: ${CLIENT_SIZE}"

# Total public size
PUBLIC_SIZE=$(du -sh .output/public 2>/dev/null | awk '{print $1}')
echo "  Total public: ${PUBLIC_SIZE}"

# Largest files
echo ""
echo "  📁 Largest files:"
du -ah .output/public/_nuxt 2>/dev/null | sort -rh | head -5 | while read size file; do
    echo "    $size - $(basename $file)"
done

echo ""

# 3. Count requests
echo "🔍 Counting static assets..."
JS_COUNT=$(find .output/public/_nuxt -name "*.js" 2>/dev/null | wc -l)
CSS_COUNT=$(find .output/public/_nuxt -name "*.css" 2>/dev/null | wc -l)
IMG_COUNT=$(find .output/public -name "*.webp" -o -name "*.png" -o -name "*.jpg" 2>/dev/null | wc -l)

echo "  JS files: ${JS_COUNT}"
echo "  CSS files: ${CSS_COUNT}"
echo "  Images: ${IMG_COUNT}"
echo "  Total: $((JS_COUNT + CSS_COUNT + IMG_COUNT))"

echo ""

# 4. Check compression
echo "🗜️  Checking Gzip compression..."
GZIP_AVAILABLE=$(find .output/public -name "*.gz" 2>/dev/null | wc -l)
if [ $GZIP_AVAILABLE -gt 0 ]; then
    echo -e "  ${GREEN}✓ Gzip files found: ${GZIP_AVAILABLE}${NC}"
else
    echo -e "  ${YELLOW}⚠ No gzip files (will be compressed by server)${NC}"
fi

echo ""

# 5. Check WebP images
echo "🖼️  Checking image formats..."
WEBP_COUNT=$(find .output/public -name "*.webp" 2>/dev/null | wc -l)
PNG_COUNT=$(find .output/public -name "*.png" 2>/dev/null | wc -l)
JPG_COUNT=$(find .output/public -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | wc -l)

if [ $WEBP_COUNT -gt 0 ]; then
    echo -e "  ${GREEN}✓ WebP images: ${WEBP_COUNT}${NC}"
else
    echo -e "  ${RED}✗ No WebP images found${NC}"
fi
echo "  PNG: ${PNG_COUNT}"
echo "  JPG: ${JPG_COUNT}"

echo ""

# 6. Start preview server
echo "🌐 Starting preview server..."
echo ""
echo -e "${YELLOW}→ Server will start at http://localhost:3000${NC}"
echo -e "${YELLOW}→ Test with Lighthouse in Chrome DevTools${NC}"
echo -e "${YELLOW}→ Or run: npm run preview${NC}"
echo ""
echo "📊 Recommended tests:"
echo "  1. Chrome DevTools > Lighthouse"
echo "  2. https://pagespeed.web.dev/"
echo "  3. https://www.webpagetest.org/"
echo "  4. https://www.ecoindex.fr/"
echo ""

# Ask if user wants to start preview
read -p "Start preview server? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    npm run preview
fi
