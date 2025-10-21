# Contributing to React CSVify

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 16+
- npm, yarn, or pnpm
- Git
- Basic knowledge of React and TypeScript

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/react-csvify.git
   cd react-csvify
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ninsau/react-csvify.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```

## Development Workflow

### Running Commands

```bash
# Build the library
npm run build

# Run tests (watch mode)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Run all quality checks
npm run quality

# Type check
npm run type-check
```

### Project Structure

```
react-csvify/
├── src/
│   ├── components/
│   │   └── DownloadButton.tsx
│   ├── utils/
│   │   ├── generateCSV.ts
│   │   ├── parseCSV.ts
│   │   ├── validateCSVData.ts
│   │   ├── formatCsvValue.ts
│   │   └── index.ts
│   ├── index.ts
│   └── types.ts
├── tests/
│   ├── components/
│   ├── utils/
│   └── integration/
├── docs/
│   ├── API.md
│   ├── EXAMPLES.md
│   ├── GUIDE.md
│   ├── SCHEMA.md
│   └── FAQ.md
├── dist/
├── biome.json
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

## Making Changes

### Branching Strategy

1. Create a new branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-bug-name
   ```

2. Make your changes following the guidelines below

3. Commit with clear, descriptive messages:
   ```bash
   git commit -m "feat: Add new feature description"
   ```

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, etc.

Examples:
- `feat: Add parseCSV utility function`
- `fix: Handle special characters in CSV values`
- `docs: Update API reference`
- `test: Add tests for formatCsvValue`

### Code Style

This project uses **Biome** for linting and formatting. Before committing:

```bash
npm run lint    # Check for issues
npm run format  # Auto-fix formatting
```

Key guidelines:
- Use ES2020+ features (async/await, optional chaining, nullish coalescing, etc.)
- Prefer `const` over `let` or `var`
- Use arrow functions for callbacks
- Write JSDoc comments for public APIs
- Keep functions focused and testable

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer explicit types over `any`
- Export types alongside implementations
- Use generics for type-safe APIs

## Adding Features

### Step 1: Plan

1. Open an issue describing the feature
2. Discuss with maintainers
3. Get approval before starting work

### Step 2: Implement

1. Add the feature in appropriate file
2. Add JSDoc comments
3. Export from `src/index.ts` if public
4. Update type definitions in `src/types.ts`

### Step 3: Test

1. Write unit tests in `tests/utils/` or `tests/components/`
2. Write integration tests if applicable
3. Ensure >80% coverage:
   ```bash
   npm run test:coverage
   ```

### Step 4: Document

1. Update relevant docs in `docs/`
2. Add examples to `docs/EXAMPLES.md`
3. Update `API.md` if API changed
4. Update `README.md` if significant

### Step 5: Submit PR

1. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a pull request on GitHub
3. Fill out the PR template
4. Wait for review

## Fixing Bugs

### Reporting

Use GitHub Issues with template:
1. Describe expected behavior
2. Describe actual behavior
3. Provide minimal reproduction
4. List environment details

### Fixing

1. Create a test that reproduces the bug
2. Fix the bug
3. Ensure test passes
4. Update docs if behavior changed
5. Submit PR with fixes

## Pull Request Process

### Before Submission

- [ ] Tests added/updated
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass: `npm run test`
- [ ] Coverage maintained: `npm run test:coverage`
- [ ] Type checking passes: `npm run type-check`
- [ ] Documentation updated
- [ ] Changes aligned with issue/discussion

### PR Title Format

Use the same format as commit messages:
- `feat: Add parseCSV utility`
- `fix: Handle edge case in CSV parsing`
- `docs: Improve API documentation`

### PR Description

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test this change

## Checklist
- [ ] Tests added
- [ ] Docs updated
- [ ] No breaking changes
- [ ] All checks pass
```

## Testing

### Unit Tests

Test individual functions and utilities:

```typescript
import { describe, it, expect } from "vitest";
import { formatCsvValue } from "../../src/utils/formatCsvValue";

describe("formatCsvValue", () => {
  it("should format a simple value with quotes", () => {
    const result = formatCsvValue("hello", true);
    expect(result.formatted).toBe('"hello"');
  });
});
```

### Component Tests

Test React components:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownloadButton from "../../src/components/DownloadButton";

describe("DownloadButton", () => {
  it("should render default link text", () => {
    render(<DownloadButton data={[{ id: 1 }]} filename="test.csv" />);
    expect(screen.getByText("Download CSV")).toBeInTheDocument();
  });
});
```

### Integration Tests

Test multiple features together:

```typescript
import { generateContent } from "../../src/utils/generateCSV";
import { parseCSV } from "../../src/utils/parseCSV";

describe("CSV Round-Trip", () => {
  it("should generate and parse back to original data", () => {
    const data = [{ id: 1, name: "Alice" }];
    const csv = generateContent(data, "csv");
    const parsed = parseCSV(csv);
    expect(parsed.data).toEqual(data);
  });
});
```

## Documentation

### Types

Use clear, descriptive type definitions:

```typescript
interface CsvParseResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  rowsProcessed: number;
}
```

### JSDoc Comments

```typescript
/**
 * Parse a CSV string into typed objects.
 * 
 * @param csvContent - The CSV content as a string
 * @param options - Parsing options
 * @returns CsvParseResult with parsed data or error
 * 
 * @example
 * const csv = "id,name\n1,John\n2,Jane";
 * const result = parseCSV(csv);
 * if (result.success) console.log(result.data);
 */
export function parseCSV<T extends object>(csvContent: string, options?: {...}): CsvParseResult<T> {
  // ...
}
```

## Releasing

Version bumping and releases are handled by maintainers following [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Release checklist:
1. Update `CHANGELOG.md`
2. Bump version in `package.json`
3. Create git tag (vX.Y.Z)
4. Publish to npm via CI/CD

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email maintainers privately
- **General Help**: Check documentation first

## Recognition

Contributors are recognized in:
- README.md
- GitHub Acknowledgments
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the ISC License.
