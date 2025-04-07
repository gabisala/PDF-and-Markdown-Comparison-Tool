# Fixing Deprecated Packages

This project contains some dependencies that use deprecated packages. To properly install the project without warnings about deprecated packages, follow these steps:

## Option 1: Using the setup script (Recommended)

1. Clone the repository and navigate to the project folder
2. Run the setup script:

```bash
npm run setup
```

This script will:
- Install dependencies
- Remove deprecated packages from node_modules
- Install newer versions of these packages

## Option 2: Manual installation

If you prefer to manually fix the issue:

1. Delete the `node_modules` folder and `package-lock.json` file
2. Install dependencies:

```bash
npm install
```

3. Remove the deprecated packages manually:

```bash
# Remove deprecated packages
rm -rf node_modules/rimraf
rm -rf node_modules/glob
rm -rf node_modules/npmlog
rm -rf node_modules/inflight
rm -rf node_modules/gauge
rm -rf node_modules/are-we-there-yet
# Also check for these packages in nested node_modules folders

# Install newer versions
npm install glob@10.3.10 rimraf@5.0.5 lru-cache@10.2.0 --save-dev
```

## Notes

- The warnings occur because some transitive dependencies (dependencies of dependencies) are using older versions of these packages
- Our package.json includes overrides to use newer versions, but sometimes npm doesn't apply them correctly to nested dependencies
- This is a common problem with npm and often requires manual intervention 