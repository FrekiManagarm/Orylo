# MaxMind GeoIP2 Database

This directory contains the MaxMind GeoLite2 database for IP geolocation.

## Setup Instructions

### 1. Sign up for MaxMind GeoLite2 (Free)

1. Go to: https://www.maxmind.com/en/geolite2/signup
2. Create a free account
3. Verify your email address

### 2. Download GeoLite2-Country Database

1. Log in to your MaxMind account
2. Go to: https://www.maxmind.com/en/accounts/current/geoip/downloads
3. Find **GeoLite2 Country** in the list
4. Click **Download GZIP** (MMDB format)
5. Extract the `.tar.gz` file to get `GeoLite2-Country.mmdb`

### 3. Place Database File

Copy the extracted `GeoLite2-Country.mmdb` file to this directory:

```bash
cp ~/Downloads/GeoLite2-Country_*/GeoLite2-Country.mmdb ./GeoLite2-Country.mmdb
```

### 4. Verify Installation

The file should be approximately **6-7 MB** in size:

```bash
ls -lh GeoLite2-Country.mmdb
# Should show: -rw-r--r--  1 user  staff   6.0M Jan 13 10:00 GeoLite2-Country.mmdb
```

### 5. Restart Development Server

```bash
cd /Users/mathieuchambaud/Documents/projects/Orylo
bun run dev
```

You should see in the logs:

```
[geolocation_detector_init] { dbPath: '...' }
[geolocation_detector_init_success] { databaseType: 'GeoLite2-Country' }
```

## File Structure

```
lib/fraud/data/
├── README.md                   # This file
├── GeoLite2-Country.mmdb       # MaxMind database (GITIGNORED)
└── .gitkeep                    # Keep directory in git
```

## Important Notes

- ⚠️ **The `.mmdb` file is gitignored** - Each developer must download it separately
- ⚠️ **The detector will be disabled** if the file is missing (graceful degradation)
- 📅 **Update monthly** - MaxMind releases new versions monthly
- 🔒 **Free tier limits** - Max 1000 downloads per day (sufficient for MVP)

## Updating the Database

MaxMind releases new GeoLite2 databases monthly. To update:

```bash
# 1. Download latest version from MaxMind
# 2. Replace old file
rm GeoLite2-Country.mmdb
cp ~/Downloads/GeoLite2-Country_*/GeoLite2-Country.mmdb .

# 3. Restart dev server
bun run dev
```

## Troubleshooting

### Error: "MaxMind database not loaded"

**Cause**: The `GeoLite2-Country.mmdb` file is missing.

**Solution**: Follow setup instructions above to download the file.

### Error: "ENOENT: no such file or directory"

**Cause**: File path is incorrect.

**Solution**: Ensure file is in `apps/web/lib/fraud/data/GeoLite2-Country.mmdb`.

### Detector not executing

**Cause**: Database failed to load during init().

**Solution**: Check console logs for `[geolocation_detector_init_failed]`.

## Production Deployment

### Option 1: Include in Docker Image (Recommended)

```dockerfile
# Dockerfile
COPY lib/fraud/data/GeoLite2-Country.mmdb /app/lib/fraud/data/
```

### Option 2: Download on Build

Add to your build script:

```bash
# Download during CI/CD
curl -o GeoLite2-Country.tar.gz "https://download.maxmind.com/..."
tar -xzf GeoLite2-Country.tar.gz
mv GeoLite2-Country_*/GeoLite2-Country.mmdb lib/fraud/data/
```

### Option 3: Use MaxMind GeoIP Update Tool

For automated updates:

```bash
# Install geoipupdate
brew install geoipupdate

# Configure with your license key
# See: https://dev.maxmind.com/geoip/updating-databases
```

## Alternative: Commercial GeoIP2 Database

For higher accuracy and more features, consider upgrading to GeoIP2 Precision:

- More accurate city/country data
- ISP and organization data
- Better VPN/proxy detection
- API available (no database file needed)

See: https://www.maxmind.com/en/solutions/geoip2-enterprise-product-suite

## License

GeoLite2 databases are distributed under the Creative Commons Attribution-ShareAlike 4.0 International License.

See: https://www.maxmind.com/en/geolite2/eula
