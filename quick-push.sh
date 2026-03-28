#!/bin/bash

# 🚀 ShaadiSetGo Quick Push Script
# Usage: ./quick-push.sh "Your commit message"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ShaadiSetGo - Quick Push${NC}"
echo "================================"

# Check if commit message provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./quick-push.sh \"Your commit message\"${NC}"
    echo ""
    echo "Example:"
    echo "  ./quick-push.sh \"✨ Added new feature\""
    echo "  ./quick-push.sh \"🐛 Fixed login bug\""
    echo "  ./quick-push.sh \"🎨 Improved UI\""
    exit 1
fi

COMMIT_MSG="$1"

echo ""
echo "1️⃣ Adding all changes..."
git add .

echo "2️⃣ Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "3️⃣ Pushing to GitHub..."
echo ""
echo -e "${YELLOW}⚠️  Enter your GitHub token when prompted${NC}"
echo -e "${YELLOW}   Or use: git push https://TOKEN@github.com/Rohit001173/Shaadisetgo.git main${NC}"
echo ""

git push -u origin main 2>/dev/null || git push https://github.com/Rohit001173/Shaadisetgo.git main

echo ""
echo -e "${GREEN}✅ Done! Check: https://github.com/Rohit001173/Shaadisetgo${NC}"
