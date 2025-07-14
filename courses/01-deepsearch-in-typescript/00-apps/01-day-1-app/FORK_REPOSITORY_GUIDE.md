# How to Fork a Repository Using GitHub CLI

This guide documents the steps taken to fork the `ai-hero-dev/ai-hero` repository while preserving all local changes.

## Prerequisites

- GitHub CLI (`gh`) installed on your system
- Git configured with your credentials
- Active internet connection

## Step 1: Save Your Local Changes

Before forking, we need to commit any uncommitted changes to preserve your work.

### Check Current Status

```bash
git status
```

### Stage All Changes

```bash
git add .
```

### Commit Changes

```bash
git commit -m "Add Google Gemini integration and chat functionality

- Install @ai-sdk/google, ai, and @ai-sdk/react packages
- Add Google Gemini model configuration in src/models.ts
- Update environment variables to include GOOGLE_GENERATIVE_AI_API_KEY
- Create API route at /api/chat for handling chat messages
- Update chat page to use useChat hook with loading spinner
- Add development guide and environment files"
```

## Step 2: Verify Prerequisites

### Check GitHub CLI Installation

```bash
gh --version
```

### Check Current Remote

```bash
git remote -v
```

## Step 3: Authenticate with GitHub CLI

If not already authenticated:

```bash
gh auth login
```

Follow the prompts to authenticate with GitHub.

## Step 4: Fork the Repository

```bash
gh repo fork ai-hero-dev/ai-hero --clone=false
```

This creates a fork in your GitHub account without cloning it locally (since we're already in the repository directory).

## Step 5: Update Remote Configuration

### Point Origin to Your Fork

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/ai-hero.git
```

### Add Original Repository as Upstream

```bash
git remote add upstream https://github.com/ai-hero-dev/ai-hero.git
```

## Step 6: Push Changes to Your Fork

### Handle Potential Conflicts

If there are conflicts with the remote:

```bash
git pull origin main --rebase
```

### Push Your Changes

```bash
git push origin main
```

## Step 7: Verify Setup

### Check Remote Configuration

```bash
git remote -v
```

You should see:

- `origin` pointing to your fork
- `upstream` pointing to the original repository

## Future Workflow

### To Sync with Original Repository

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### To Create Feature Branches

```bash
git checkout -b feature/your-feature-name
# Make your changes
git add .
git commit -m "Your commit message"
git push origin feature/your-feature-name
```

## Summary

✅ **Successfully forked `ai-hero-dev/ai-hero` to `Kneesal/ai-hero`**

✅ **All local changes preserved and pushed to your fork**

✅ **Remote configuration updated:**

- `origin` → Your fork (`Kneesal/ai-hero`)
- `upstream` → Original repository (`ai-hero-dev/ai-hero`)

## Benefits of This Setup

1. **Preservation of Work**: All your local changes were committed and pushed to your fork
2. **Clean Remote Setup**: Origin points to your fork, upstream to the original
3. **Easy Syncing**: You can easily sync with the original repository when needed
4. **Contribution Ready**: You can create pull requests from your fork to the original repository

## Troubleshooting

### Authentication Issues

If you get authentication errors:

```bash
gh auth login
```

### Push Conflicts

If push is rejected due to conflicts:

```bash
git pull origin main --rebase
git push origin main
```

### View Current Branch and Status

```bash
git branch -v
git status
```

---

**Note**: This process was completed on $(date) for the AI Hero course repository, preserving all Google Gemini integration work and chat functionality implementations.
