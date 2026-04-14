---
name: iq-upload
description: Upload Hermes skills to Solana blockchain using IQLabs SDK. Use when you need to permanently store a skill on-chain, share skills with other agents, or backup skills immutably.
license: MIT
metadata:
  author: iq-labs-community
  version: "1.0.0"
  hermes:
    tags: [solana, blockchain, upload, skills, iqlabs]
    category: devops
    requires_toolsets: [terminal]
---

# IQ Upload Skill

Upload and manage Hermes agent skills on-chain using the IQLabs SDK.

## When to Use

- **Upload skills**: Permanently store skill files on Solana blockchain
- **Share skills**: Make skills available to other agents via on-chain storage
- **Backup skills**: Create immutable backups of important skills
- **Skill marketplace**: Publish skills for decentralized discovery

## Prerequisites

1. **iqlabs-core installed**: The standalone tool must be installed globally
   ```bash
   cd /home/abhi/iqlabs-core
   npm install -g .
   ```

2. **Environment configured**: Add to `~/.hermes/.env`:
   ```bash
   SOLANA_RPC_URL=https://api.devnet.solana.com
   SOLANA_PRIVATE_KEY=your_base58_private_key
   ```

## Commands

### Upload a Skill

```bash
# Upload a skill directory to Solana
/iq-upload ~/.hermes/skills/my-skill/

# Upload with validation only (dry run)
/iq-upload ~/.hermes/skills/my-skill/ --dry-run

# Upload with encryption (private skill)
/iq-upload ~/.hermes/skills/my-skill/ --encrypt
```

### Download a Skill

```bash
# Download skill by transaction signature
/iq-download 5Xg7...abc123 --install

# Download and overwrite existing
/iq-download 5Xg7...abc123 --install --force
```

### List Uploaded Skills

```bash
# List all skills uploaded by your wallet
/iq-list

# List with full signatures
/iq-list --verbose
```

## Procedure

### 1. Prepare Skill for Upload

1. Ensure skill directory has `SKILL.md` with proper frontmatter
2. Verify skill name follows convention: lowercase with hyphens
3. Check that required files exist (SKILL.md minimum)

### 2. Upload to Solana

1. Run `/iq-upload <skill-path>` from Hermes
2. The skill will:
   - Package skill directory (tar.gz)
   - Upload via IQLabs `codeIn()` function
   - Show green progress bar
   - Return transaction signature
3. Save the transaction signature - this is your skill ID

### 3. Share or Retrieve

- **Share**: Give others the transaction signature
- **Verify**: Anyone can read the skill using `/iq-download <tx-sig>`
- **Install**: Downloaded skills auto-validate against SKILL.md spec

## Example Workflow

```bash
# From within Hermes:
> /iq-upload ~/.hermes/skills/my-awesome-skill/
# → Returns: Transaction signature 5Xg7...abc123

# Share the signature with others
# They can download with:
> /iq-download 5Xg7...abc123 --install

# Or list your uploads:
> /iq-list
```

## On-Chain Storage

Skills are stored using IQLabs Code-In technology:
- **Cost**: ~2000x cheaper than traditional Solana storage
- **Permanent**: Immutable once uploaded
- **Public**: Anyone can read (unless encrypted)
- **Retrievable**: Via transaction signature

## Security Notes

- Skills are **immutable** - upload carefully
- Use **encryption** for skills containing sensitive patterns
- **Verify** downloaded skills before installing
- Keep **backups** of original skill directories

## Related

- [IQLabs SDK Docs](https://iqlabs.mintlify.app/docs)
- [Hermes Skills Hub](https://hermes-agent.nousresearch.com/docs/skills)
