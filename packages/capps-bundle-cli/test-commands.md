# Quick CLI Testing Commands

Copy & paste these commands to quickly test the CLI functionality.

## 1. Setup (One-time)

```bash
# Navigate to CLI package
cd packages/capps-bundle-cli

# Install dependencies
npm install

# Link globally (optional, for global access)
npm link

# Create test app
mkdir -p ~/test-capps-app/public/src/styles
cd ~/test-capps-app
```

## 2. Quick Tests (Copy & Paste Each)

### Test Version & Help
```bash
capps-bundle version
capps-bundle help
```

### Create Test Configuration
```bash
cat > public/assets.json << 'EOF'
{
  "app_name": "test-app",
  "bundler": "vite",
  "build": {
    "entry_points": {
      "app": "src/index.js",
      "styles": "src/styles/main.scss"
    }
  }
}
EOF

echo "console.log('Test');" > src/index.js
echo "body { color: #333; }" > src/styles/main.scss
```

### Test Validation
```bash
# Should PASS
capps-bundle validate

# Should show config
capps-bundle validate --debug
```

### Test Package Management
```bash
capps-bundle list-pkg
```

### Test Error Handling
```bash
# Create invalid config
cat > public/assets.json << 'EOF'
{
  "app_name": "test",
  "bundler": "rollup",
  "build": { "entry_points": { "app": "src/missing.js" } }
}
EOF

# Should show errors
capps-bundle validate
```

### Test Clean Command
```bash
# Should handle missing dist gracefully
capps-bundle clean
```

## 3. Full Build Test (If Bundler Installed)

```bash
# Install Vite
npm init -y
npm install vite @vitejs/plugin-vue --save-dev

# Reset to valid config
cat > public/assets.json << 'EOF'
{
  "app_name": "test-app",
  "bundler": "vite",
  "build": {
    "entry_points": {
      "app": "src/index.js"
    }
  }
}
EOF

# Build
capps-bundle build

# Check output
ls -la public/dist/
cat public/dist/manifest.json

# Analyze
capps-bundle analyze

# Clean up
capps-bundle clean
```

## 4. Test Different Bundlers

```bash
# Test Webpack detection
cat > public/assets.json << 'EOF'
{
  "app_name": "test",
  "bundler": "webpack",
  "build": { "entry_points": { "app": "src/index.js" } }
}
EOF
capps-bundle validate

# Test esbuild detection
sed -i 's/"webpack"/"esbuild"/' public/assets.json
capps-bundle validate

# Test Vite detection
sed -i 's/"esbuild"/"vite"/' public/assets.json
capps-bundle validate
```

## 5. Test Real App (capps-guinea-pig)

```bash
cd /path/to/capps-guinea-pig

# Run all commands
capps-bundle validate
capps-bundle list-pkg
capps-bundle help
capps-bundle version

# Check existing config
cat public/assets.json

# Check entry points exist
ls -la src/
```

## 6. Automated Test

```bash
# Run test script (if bash available)
cd packages/capps-bundle-cli
bash test-cli.sh
```

## 7. Success Indicators

✅ `capps-bundle version` shows `1.0.0`
✅ `capps-bundle help` lists all commands
✅ `capps-bundle validate` passes with valid config
✅ `capps-bundle validate` shows errors with invalid config
✅ `capps-bundle list-pkg` doesn't crash
✅ `capps-bundle clean` gracefully handles missing dirs
✅ All error messages are helpful and actionable

## Troubleshooting

### If `capps-bundle` not found

Use local path instead:
```bash
node packages/capps-bundle-cli/bin/capps-bundle.js validate
```

Or run from CLI directory:
```bash
cd packages/capps-bundle-cli
node bin/capps-bundle.js validate
```

### If npm link issues

Unlink and try again:
```bash
npm unlink -g @capps/bundle-cli
cd packages/capps-bundle-cli
npm link
```

### If permissions issue

Make file executable:
```bash
chmod +x packages/capps-bundle-cli/bin/capps-bundle.js
```

---

**Note:** All tests are read-only and safe. They don't modify your repository.
