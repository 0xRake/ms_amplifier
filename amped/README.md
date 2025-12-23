# Amped

A modern macOS desktop application for [Amplifier](https://github.com/microsoft/amplifier) - the AI-powered modular development assistant.

![Amped Screenshot](docs/screenshot.png)

## Features

- 🎨 **Modern UI** - Beautiful interface inspired by Claude Desktop and ZED text editor
- 💬 **Chat Interface** - Real-time streaming conversations with Amplifier
- 📝 **Code Editor** - Built-in code editor for seamless development
- 📊 **Session Management** - Browse, resume, and manage conversation sessions
- ⚙️ **Profile Switching** - Easy switching between dev, base, test, and custom profiles
- 🔌 **MCP Management** - Monitor, add, and track Model Context Protocol servers
- 🛠️ **Skills Tracking** - Enable/disable Amplifier skills
- 💾 **Backup & Restore** - Backup and restore your configuration
- 🌙 **Dark/Light Mode** - Follows system preferences

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Native Shell | **Tauri 2.0** | Lightweight native wrapper (~10MB) |
| Frontend | **Next.js 14** | React framework with App Router |
| Styling | **Tailwind CSS** | Utility-first CSS framework |
| Components | **shadcn/ui** | Beautiful, accessible components |
| Design System | **Geist** | Clean, modern typography |
| State | **Zustand** | Lightweight state management |

## Prerequisites

Before building Amped, ensure you have:

1. **Node.js 18+** - [Install Node.js](https://nodejs.org/)
2. **Rust** - [Install Rust](https://rustup.rs/)
3. **Xcode Command Line Tools** (macOS) - `xcode-select --install`
4. **Amplifier CLI** (optional, for full functionality):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   uv tool install git+https://github.com/microsoft/amplifier
   ```

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run tauri:dev
```

### Production Build

```bash
# Build for macOS
npm run tauri:build
```

The built application will be in `src-tauri/target/release/bundle/`.

## Project Structure

```
amped/
├── src/                     # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── layout.tsx       # Root layout with theme provider
│   │   ├── page.tsx         # Main application page
│   │   └── globals.css      # Global styles (Tailwind + custom)
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── ChatPanel.tsx    # Chat interface
│   │   ├── EditorPanel.tsx  # Code editor
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── TitleBar.tsx     # macOS title bar
│   │   └── SettingsDialog.tsx # Settings modal
│   └── lib/                 # Utilities and state
│       ├── amplifier.ts     # Tauri command wrappers
│       ├── store.ts         # Zustand state store
│       └── utils.ts         # Utility functions
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── main.rs          # Entry point
│   │   ├── lib.rs           # Tauri setup
│   │   └── commands.rs      # CLI bridge commands
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── package.json             # Node dependencies
├── tailwind.config.ts       # Tailwind configuration
└── next.config.js           # Next.js configuration
```

## Configuration

Amped uses Amplifier's configuration system. Settings are stored in `~/.amplifier/`:

- `settings.yaml` - Main configuration
- `system_prompt.md` - Custom system prompt
- `profiles/` - Custom profiles
- `backups/` - Configuration backups

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + Enter` | Send message |
| `⌘ + ,` | Open settings |
| `⌘ + 1` | Switch to Chat view |
| `⌘ + 2` | Switch to Editor view |
| `⌘ + 3` | Switch to Split view |
| `⌘ + S` | Save file (in editor) |

## Contributing

Contributions are welcome! Please see the main [Amplifier repository](https://github.com/microsoft/amplifier) for contribution guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.
