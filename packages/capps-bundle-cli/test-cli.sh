#!/bin/bash

# CAPPS Bundle CLI - Automated Test Script
# Tests all commands and basic functionality

set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# Colors for output
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    TEST_COUNT=$((TEST_COUNT + 1))
    echo -e "${YELLOW}[Test $TEST_COUNT]${NC} $1"
}

print_pass() {
    PASS_COUNT=$((PASS_COUNT + 1))
    echo -e "${GREEN}✓ PASS${NC}: $1\n"
}

print_fail() {
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo -e "${RED}✗ FAIL${NC}: $1\n"
}

# Create test directory
TEST_DIR="/tmp/capps-bundle-test-$$"
mkdir -p "$TEST_DIR/public/src/styles"
cd "$TEST_DIR"

print_header "CAPPS Bundle CLI - Test Suite"

# Test 1: Version command
print_test "Version command"
if capps-bundle version 2>&1 | grep -q "capps-bundle version"; then
    print_pass "Version command works"
else
    print_fail "Version command failed"
fi

# Test 2: Help command
print_test "Help command"
if capps-bundle help 2>&1 | grep -q "Commands:"; then
    print_pass "Help command works"
else
    print_fail "Help command failed"
fi

# Test 3: Missing assets.json error
print_test "Error handling - Missing assets.json"
if capps-bundle validate 2>&1 | grep -q "assets.json not found"; then
    print_pass "Missing assets.json error detected"
else
    print_fail "Missing assets.json error not detected"
fi

# Create valid assets.json
cat > public/assets.json << 'EOF'
{
  "app_name": "test-app",
  "version": "1.0.0",
  "bundler": "vite",
  "build": {
    "entry_points": {
      "app": "src/index.js",
      "styles": "src/styles/main.scss"
    },
    "output_dir": "public/dist/",
    "hash_bundles": true,
    "minify": true
  },
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["app", "styles"],
      "load_type": "always"
    }
  ]
}
EOF

# Create entry points
cat > src/index.js << 'EOF'
console.log('Test App');
export default { name: 'test' };
EOF

cat > src/styles/main.scss << 'EOF'
body { color: #333; }
EOF

# Test 4: Validate with valid config
print_test "Validate command with valid config"
if capps-bundle validate 2>&1 | grep -q "validation passed"; then
    print_pass "Configuration validation passed"
else
    print_fail "Configuration validation failed"
fi

# Test 5: Check app name in output
print_test "Config loading and display"
if capps-bundle validate 2>&1 | grep -q "test-app"; then
    print_pass "App name correctly loaded from config"
else
    print_fail "App name not found in output"
fi

# Test 6: Check bundler detection
print_test "Bundler detection"
if capps-bundle validate 2>&1 | grep -q "Bundler.*vite"; then
    print_pass "Vite bundler correctly detected"
else
    print_fail "Bundler detection failed"
fi

# Test 7: List packages (should handle no packages gracefully)
print_test "List packages command"
if capps-bundle list-pkg 2>&1 | grep -q "packages"; then
    print_pass "List packages command works"
else
    print_fail "List packages command failed"
fi

# Test 8: Clean command (should handle missing dist gracefully)
print_test "Clean command"
if capps-bundle clean 2>&1 | grep -q "Cleaning"; then
    print_pass "Clean command works"
else
    print_fail "Clean command failed"
fi

# Test 9: Invalid bundler error
print_test "Error handling - Invalid bundler"
cat > public/assets.json << 'EOF'
{
  "app_name": "test",
  "bundler": "parcel",
  "build": { "entry_points": { "app": "src/index.js" } }
}
EOF

if capps-bundle validate 2>&1 | grep -q "Invalid bundler"; then
    print_pass "Invalid bundler error detected"
else
    print_fail "Invalid bundler error not detected"
fi

# Test 10: Missing entry point error
print_test "Error handling - Missing entry point"
cat > public/assets.json << 'EOF'
{
  "app_name": "test",
  "bundler": "vite",
  "build": { "entry_points": { "app": "src/missing.js" } }
}
EOF

if capps-bundle validate 2>&1 | grep -q "not found"; then
    print_pass "Missing entry point error detected"
else
    print_fail "Missing entry point error not detected"
fi

# Test 11: Debug flag
print_test "Debug flag"
if capps-bundle validate --debug 2>&1 | grep -q "→"; then
    print_pass "Debug output enabled with --debug flag"
else
    print_fail "Debug output not working"
fi

# Test 12: Unknown command
print_test "Error handling - Unknown command"
if capps-bundle unknowncmd 2>&1 | grep -q "Unknown command"; then
    print_pass "Unknown command error detected"
else
    print_fail "Unknown command error not detected"
fi

# Cleanup
cd /
rm -rf "$TEST_DIR"

# Print summary
print_header "Test Summary"
echo -e "Total Tests:  ${BLUE}$TEST_COUNT${NC}"
echo -e "Passed:       ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed:       ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}\n"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}\n"
    exit 1
fi
