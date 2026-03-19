#!/bin/bash

# Quevix Mobile App - Build Readiness Check

echo "🔍 Checking Quevix Mobile App Build Setup..."
echo ""

# Check if google-services.json exists
if [ -f "/app/mobile/google-services.json" ]; then
    echo "✅ google-services.json found"
    
    # Verify it's valid JSON
    if python3 -m json.tool /app/mobile/google-services.json > /dev/null 2>&1; then
        echo "✅ google-services.json is valid JSON"
        
        # Extract project ID
        PROJECT_ID=$(cat /app/mobile/google-services.json | python3 -c "import sys, json; print(json.load(sys.stdin)['project_info']['project_id'])")
        echo "✅ Firebase Project: $PROJECT_ID"
    else
        echo "❌ google-services.json is invalid"
        exit 1
    fi
else
    echo "❌ google-services.json not found"
    exit 1
fi

# Check Firebase config
if [ -f "/app/mobile/src/firebaseConfig.js" ]; then
    echo "✅ Firebase config found"
    
    # Check if placeholder values exist
    if grep -q "YOUR_API_KEY_HERE" /app/mobile/src/firebaseConfig.js; then
        echo "⚠️  Warning: Firebase config contains placeholders"
    else
        echo "✅ Firebase config looks good"
    fi
else
    echo "❌ Firebase config not found"
fi

# Check app.json
if [ -f "/app/mobile/app.json" ]; then
    echo "✅ app.json found"
    
    # Check package name
    PACKAGE_NAME=$(cat /app/mobile/app.json | python3 -c "import sys, json; print(json.load(sys.stdin)['expo']['android']['package'])")
    echo "✅ Package name: $PACKAGE_NAME"
else
    echo "❌ app.json not found"
fi

# Check eas.json
if [ -f "/app/mobile/eas.json" ]; then
    echo "✅ eas.json found"
else
    echo "⚠️  eas.json not found (will be created by eas build:configure)"
fi

# Check package.json
if [ -f "/app/mobile/package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
fi

echo ""
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count checks
TOTAL=5
PASSED=0

[ -f "/app/mobile/google-services.json" ] && ((PASSED++))
[ -f "/app/mobile/src/firebaseConfig.js" ] && ((PASSED++))
[ -f "/app/mobile/app.json" ] && ((PASSED++))
[ -f "/app/mobile/eas.json" ] && ((PASSED++))
[ -f "/app/mobile/package.json" ] && ((PASSED++))

echo "Passed: $PASSED/$TOTAL checks"

if [ $PASSED -eq $TOTAL ]; then
    echo ""
    echo "🎉 All checks passed! Ready to build APK."
    echo ""
    echo "Next steps:"
    echo "1. npm install -g eas-cli"
    echo "2. cd /app/mobile"
    echo "3. eas login"
    echo "4. eas build --platform android --profile preview"
    echo ""
else
    echo ""
    echo "⚠️  Some checks failed. Review errors above."
    echo ""
fi
