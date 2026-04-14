#!/bin/bash
# Install IQ Upload skill for Hermes

set -e

echo "Installing IQ Upload Hermes Skill..."

# Check if iqlabs is installed
if ! command -v iqlabs &> /dev/null; then
    echo "❌ iqlabs is not installed!"
    echo "Please run first: npm install -g ."
    exit 1
fi

echo "✅ iqlabs found at: $(which iqlabs)"

# Create skill directory
SKILL_DIR="$HOME/.hermes/skills/iq-upload"
mkdir -p "$SKILL_DIR"

echo "📁 Created directory: $SKILL_DIR"

# Copy skill files
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_DIR/hermes-skill/SKILL.md" "$SKILL_DIR/"
cp "$SCRIPT_DIR/hermes-skill/iq-upload" "$SKILL_DIR/"
cp "$SCRIPT_DIR/hermes-skill/iq-download" "$SKILL_DIR/"
cp "$SCRIPT_DIR/hermes-skill/iq-list" "$SKILL_DIR/"

# Make scripts executable
chmod +x "$SKILL_DIR/iq-upload"
chmod +x "$SKILL_DIR/iq-download"
chmod +x "$SKILL_DIR/iq-list"

echo "📄 Copied skill files"

# Create global symlinks for Hermes to find commands
if [ -w "/usr/local/bin" ]; then
    ln -sf "$SKILL_DIR/iq-upload" /usr/local/bin/iq-upload
    ln -sf "$SKILL_DIR/iq-download" /usr/local/bin/iq-download
    ln -sf "$SKILL_DIR/iq-list" /usr/local/bin/iq-list
    echo "🔗 Created symlinks in /usr/local/bin"
else
    echo "⚠️  Need sudo to create global symlinks"
    echo "Running: sudo ln -sf ..."
    sudo ln -sf "$SKILL_DIR/iq-upload" /usr/local/bin/iq-upload
    sudo ln -sf "$SKILL_DIR/iq-download" /usr/local/bin/iq-download
    sudo ln -sf "$SKILL_DIR/iq-list" /usr/local/bin/iq-list
    echo "🔗 Created symlinks with sudo"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "You can now use:"
echo "  • iqlabs upload <path>       (standalone CLI)"
echo "  • /iq-upload <path>          (inside Hermes)"
echo "  • /iq-download <sig>         (inside Hermes)"
echo "  • /iq-list                   (inside Hermes)"
echo ""
echo "Test it:"
echo "  iqlabs list"
