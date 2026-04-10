# Contributing to RAG YouTube Advancer

Thank you for your interest in contributing. This document outlines the process for contributing to this project through GitHub.

## How to Contribute

### 1. Fork the Repository

Click the "Fork" button on the GitHub repository page, or use the command line:

```bash
git clone https://github.com/PabloViniegra/rag-youtube-advancer.git
cd rag-youtube-advancer
```

### 2. Create a Feature Branch

Create a new branch for your feature or bugfix:

```bash
git checkout -b feat/your-feature-name
git checkout -b fix/your-bugfix-name
```

Branch naming conventions:

- `feat/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### 3. Make Your Changes

Implement your changes following the project conventions:

- Use TypeScript with strict typing
- Follow the existing code style (Biome handles formatting)
- Write unit tests for new functionality
- Keep components under 200 lines

### 4. Run Quality Checks

Before submitting, verify your code:

```bash
# Format code
bun format

# Lint code
bun lint

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage
```

### 5. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Add feature: description of changes"
```

### 6. Push to Your Fork

```bash
git push origin your-branch-name
```

### 7. Create a Pull Request

1. Navigate to the original repository
2. Click "Pull Request"
3. Fill in the title and description
4. Reference any related issues

## Pull Request Guidelines

### PR Title Format

```
[type]: [short description]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Adding tests
- `chore`: Maintenance

### PR Description

Include:

- **What**: Brief description of the changes
- **Why**: Reasoning behind the changes
- **How**: High-level implementation approach
- **Testing**: How you tested the changes

### Requirements

- [ ] Code follows project conventions
- [ ] Tests pass (`bun test`)
- [ ] Linting passes (`bun lint`)
- [ ] Build succeeds (`bun build`)
- [ ] Related documentation updated (if applicable)

## Code Style

The project uses:

- **Biome** for formatting and linting
- **Tailwind CSS 4** for styling
- **React 19** patterns with TypeScript

Run formatting before committing:

```bash
bun format
```

## Testing

Add tests for new functionality in `src/lib/**/*.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('module name', () => {
  it('should describe expected behavior', () => {
    expect(true).toBe(true);
  });
});
```

Run tests:

```bash
bun run test           # Run once
bun run test --watch  # Watch mode
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Review closed PRs for context on past decisions

## Recognition

Contributors will be acknowledged in the project documentation. Thank you for your help!