# Setup Guide - IQ Skill Uploader

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/ANISH-SR/iq-hermes.git
cd iq-hermes
npm install -g .
```

This installs the `iqlabs` command globally.

### 2. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with your keys
```

Add to `.env`:
```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_base58_private_key_here
```

### 3. Install Hermes Skill (Optional)

To use `/iq-upload` inside Hermes:

```bash
# Run the installer
./install-hermes-skill.sh
```

This creates the skill at `~/.hermes/skills/iq-upload/`

### 4. Verify Installation

```bash
iqlabs --version        # Should show v1.0.0
iqlabs list             # Show registry
which iq-upload         # Should find the command
```

---

## Manual Setup (If Automatic Fails)

### Step 1: Install Dependencies

```bash
cd iq-hermes
npm install
```

### Step 2: Build

```bash
npm run build
```

### Step 3: Link Commands

```bash
# Option A: Install globally
npm install -g .

# Option B: Create symlinks manually
sudo ln -sf $(pwd)/dist/cli/iqlabs.js /usr/local/bin/iqlabs
sudo ln -sf $(pwd)/hermes-skill/iq-upload /usr/local/bin/iq-upload
sudo ln -sf $(pwd)/hermes-skill/iq-download /usr/local/bin/iq-download
sudo ln -sf $(pwd)/hermes-skill/iq-list /usr/local/bin/iq-list
```

### Step 4: Setup Hermes Skill

```bash
mkdir -p ~/.hermes/skills/iq-upload
cp hermes-skill/* ~/.hermes/skills/iq-upload/
chmod +x ~/.hermes/skills/iq-upload/iq-*
```

---

## Getting Your Solana Private Key

### From Phantom Wallet
1. Open Phantom → Settings → Export Private Key
2. Copy the 88-character base58 string

### From Solana CLI
```bash
solana config get                    # Shows keypair path
cat ~/.config/solana/id.json         # Shows key array
```

Convert to base58:
```bash
node -e "
const bs58 = require('bs58');
const arr = [/* paste array numbers here */];
console.log(bs58.encode(Buffer.from(arr)));
"
```

---

## Testing Your Setup

### Test 1: Upload
```bash
# Create test skill
mkdir -p /tmp/test-skill
cat > /tmp/test-skill/SKILL.md << 'EOF'
---
name: test-skill
description: A test skill
---
# Test
This is a test.
EOF

# Upload
iqlabs upload /tmp/test-skill --dry-run  # Validate
iqlabs upload /tmp/test-skill            # Real upload
```

### Test 2: Download
```bash
# Use your actual transaction signature
iqlabs download <transaction-signature> --install
```

### Test 3: In Hermes
```bash
hermes
> /iq-list
> /iq-upload ~/.hermes/skills/coin-flip/
```

---

## Troubleshooting

### "command not found: iqlabs"
```bash
npm install -g /path/to/iq-hermes
# Or add to PATH:
export PATH="$PATH:/path/to/iq-hermes/dist/cli"
```

### "bad secret key size"
Your private key is wrong format. Must be 88 characters base58.

### "SOLANA_RPC_URL not found"
Create `.env` file in the iq-hermes directory.

### "/iq-upload not found" in Hermes
Run the installer or manually link:
```bash
sudo ln -sf ~/.hermes/skills/iq-upload/iq-upload /usr/local/bin/
```

---

## Directory Structure After Setup

```
~/.hermes/skills/
└── iq-upload/
    ├── SKILL.md          # Documentation
    ├── iq-upload         # Wrapper script
    ├── iq-download       # Wrapper script
    └── iq-list           # Wrapper script

iq-hermes/                # Git repo
├── dist/                 # Compiled JS
├── src/                  # Source code
├── hermes-skill/         # Skill templates
├── .env                  # Your config (gitignored)
└── package.json
```

---

## Next Steps

1. **Upload your first skill**: `iqlabs upload ~/.hermes/skills/my-skill/`
2. **Share the signature**: Post the transaction signature
3. **Download others' skills**: `iqlabs download <sig> --install`
4. **Use in Hermes**: Type `> /iq-upload` or `> /iq-download`

---

## Support

- GitHub Issues: https://github.com/ANISH-SR/iq-hermes/issues
- IQLabs Docs: https://iqlabs.mintlify.app/docs
