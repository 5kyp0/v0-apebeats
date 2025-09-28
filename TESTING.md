# Testing Guide for ApeBeats

## Overview

This document outlines the testing strategy and setup for the ApeBeats project, including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
__tests__/
├── components/          # Component unit tests
├── lib/                # Utility function tests
├── integration/        # Integration tests
└── e2e/               # End-to-end tests
```

## Test Types

### 1. Unit Tests
- **Location**: `__tests__/components/`, `__tests__/lib/`
- **Purpose**: Test individual components and utility functions in isolation
- **Tools**: Jest, React Testing Library
- **Coverage**: 70% minimum threshold

### 2. Integration Tests
- **Location**: `__tests__/integration/`
- **Purpose**: Test how different parts of the application work together
- **Examples**: Wallet connection flow, API integrations
- **Tools**: Jest, React Testing Library

### 3. End-to-End Tests
- **Location**: `__tests__/e2e/`
- **Purpose**: Test complete user workflows
- **Examples**: Full user journey from landing to wallet connection
- **Tools**: Jest, React Testing Library (simulated E2E)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ErrorBoundary.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="wallet"
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Uses Next.js Jest configuration
- Supports TypeScript and ES modules
- Includes proper module mapping for `@/` imports
- Transforms thirdweb and related dependencies

### Setup File (`jest.setup.js`)
- Configures testing environment
- Mocks external dependencies (thirdweb, navigation, etc.)
- Sets up BigInt serialization support
- Provides browser API mocks

## Mocking Strategy

### External Dependencies
- **thirdweb**: Mocked to prevent actual blockchain calls
- **@use-glyph**: Mocked for wallet functionality
- **@tanstack/react-query**: Mocked for data fetching
- **next/navigation**: Mocked for routing

### Browser APIs
- `window.ethereum`: Mocked for wallet interactions
- `localStorage`/`sessionStorage`: Mocked for persistence
- `IntersectionObserver`/`ResizeObserver`: Mocked for UI components

## Writing Tests

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>No error</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})
```

### Hook Tests
```typescript
import { renderHook, waitFor, act } from '@testing-library/react'
import { useVideoPreviews } from '@/lib/useVideoPreviews'

describe('useVideoPreviews', () => {
  it('should load video previews', async () => {
    const { result } = renderHook(() => useVideoPreviews(['video1.mp4']))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})
```

### Integration Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { TestWrapper } from './test-utils'

describe('Wallet Connection Integration', () => {
  it('should connect wallet successfully', async () => {
    render(
      <TestWrapper>
        <WalletConnection />
      </TestWrapper>
    )
    
    const connectButton = screen.getByText(/connect/i)
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      expect(screen.getByText(/connected/i)).toBeInTheDocument()
    })
  })
})
```

## Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests in `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### 2. Async Testing
- Use `waitFor` for async operations
- Wrap state updates in `act()` when needed
- Handle loading states properly

### 3. Mocking
- Mock external dependencies at the module level
- Use `jest.fn()` for function mocks
- Provide realistic mock data

### 4. Coverage
- Aim for 70%+ coverage
- Focus on critical business logic
- Don't test implementation details

## Common Issues & Solutions

### BigInt Serialization
```typescript
// In jest.setup.js
expect.addSnapshotSerializer({
  test: (val) => typeof val === 'bigint',
  print: (val) => val.toString(),
})
```

### React State Updates
```typescript
import { act } from '@testing-library/react'

// Wrap state updates in act()
act(() => {
  result.current.someStateUpdate()
})
```

### ESM Module Issues
```javascript
// In jest.config.js
transformIgnorePatterns: [
  'node_modules/(?!(thirdweb|@use-glyph|viem)/)',
]
```

## Future Improvements

### 1. Playwright E2E Tests
- Add real browser E2E tests
- Test actual wallet connections
- Verify blockchain interactions

### 2. Visual Regression Tests
- Add screenshot testing
- Ensure UI consistency
- Test responsive design

### 3. Performance Tests
- Add performance benchmarks
- Test bundle size
- Monitor Core Web Vitals

### 4. Accessibility Tests
- Add a11y testing
- Ensure WCAG compliance
- Test keyboard navigation

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Scheduled runs

Coverage reports are generated and tracked to ensure quality standards are maintained.
