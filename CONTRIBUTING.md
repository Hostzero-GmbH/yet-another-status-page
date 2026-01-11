# Contributing to Hostzero Status

Thank you for your interest in contributing to Hostzero Status! We welcome contributions from the community and are grateful for any help you can provide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to maintain a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/status-page.git
   cd hostzero-status
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/Hostzero-GmbH/status-page.git
   ```

## Development Setup

For detailed setup instructions, see the [Local Development Guide](https://hostzero.github.io/hostzero-status/development/local-setup/).

### Quick Start

```bash
# Install dependencies
npm install

# Start the database
docker compose -f docker-compose.dev.yml up -d postgres

# Set up environment
cp .env.example .env

# Start the development server
npm run dev
```

Access at http://localhost:3333 (status page) and http://localhost:3333/admin (admin panel).

## Making Changes

### Branch Naming

Create a descriptive branch name:

- `feature/add-webhook-support` - For new features
- `fix/email-notification-bug` - For bug fixes
- `docs/update-api-reference` - For documentation
- `refactor/improve-rate-limiting` - For code refactoring

### Creating a Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

### Commit Messages

We follow conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(notifications): add webhook support for external integrations

fix(subscribe): resolve rate limiting bypass issue

docs(api): update REST API documentation with new endpoints
```

## Pull Request Process

1. **Update your branch** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - A clear title describing the change
   - A description of what was changed and why
   - Reference to any related issues (e.g., "Fixes #123")
   - Screenshots for UI changes

4. **Address review feedback** by pushing additional commits

5. **Merge requirements**:
   - All CI checks must pass
   - At least one maintainer approval
   - No merge conflicts

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types; avoid `any` when possible
- Use interfaces for object shapes
- Export types that may be used elsewhere

### React/Next.js

- Use functional components with hooks
- Follow the App Router conventions
- Use Server Components where appropriate
- Keep components focused and reusable

### Styling

- Use Tailwind CSS for styling
- Follow the existing design patterns
- Ensure responsive design
- Support both light and dark themes

### Code Quality

- Run linting before committing:
  ```bash
  npm run lint
  ```

- Keep functions small and focused
- Add comments for complex logic
- Use meaningful variable and function names

### Payload CMS

- Follow Payload's collection and field conventions
- Use hooks appropriately (beforeChange, afterChange, etc.)
- Implement proper access control
- Add admin descriptions for better UX

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**:
   - OS and version
   - Node.js version
   - Browser (if applicable)
   - Docker version (if applicable)
6. **Screenshots/Logs**: Any relevant screenshots or error logs

### Feature Requests

For feature requests, please include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How would you like it to work?
3. **Alternatives**: Any alternative solutions you've considered
4. **Additional Context**: Any other relevant information

## Questions?

If you have questions about contributing, feel free to:

- Open a GitHub Discussion
- Ask in an existing issue
- Reach out to the maintainers

Thank you for contributing to Hostzero Status!
