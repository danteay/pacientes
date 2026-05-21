# Migration Guide: Transitioning to the Refactored Architecture

## Overview

This guide helps you migrate from the old codebase to the new refactored architecture. The refactored code is available alongside the old code, allowing for a gradual migration.

## Quick Start

### Option 1: Use Refactored Components Directly

To start using the refactored architecture immediately:

**1. Update your entry point (`src/renderer/index.tsx`):**

```typescript
// Old
import App from './App';

// New
import AppRefactored from './AppRefactored';

// Then use AppRefactored instead of App
root.render(<AppRefactored />);
```

**2. That's it!** The refactored app uses all the new patterns internally.

### Option 2: Gradual Migration

Migrate components one by one:

## Backend Migration Steps

### Step 1: Understanding the New Layer Structure

**Old Structure:**
```
DatabaseService → Users/Appointments → Database
```

**New Structure:**
```
DatabaseService → Service Layer → Repository Layer → Driver Layer → Database
```

### Step 2: Using the New DatabaseService

The new DatabaseService maintains the same public API, so existing IPC handlers should work without changes:

**In `src/main/main.ts`:**

```typescript
// Old import
import { DatabaseService } from './database/database';

// New import
import { DatabaseService } from './database/database-service';

// Everything else stays the same!
```

The migration is backward-compatible for the main process.

## Frontend Migration Steps

### Step 1: Add Context Providers

Wrap your app with the NotificationProvider:

```typescript
// src/renderer/index.tsx or src/renderer/App.tsx
import { NotificationProvider } from './context';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        {/* Your existing app components */}
      </NotificationProvider>
    </ErrorBoundary>
  );
}
```

### Step 2: Migrate Class Components to Functional Components

**Example: Migrating PatientList**

**Old (Class Component):**
```typescript
class PatientList extends Component<PatientListProps, PatientListState> {
  constructor(props) {
    super(props);
    this.state = {
      patients: [],
      searchTerm: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    this.loadPatients();
  }

  loadPatients = async () => {
    // Direct IPC call
    const result = await window.api.patient.getAll();
    // ... handle result
  }
}
```

**New (Functional Component with Hooks):**
```typescript
import { useEffect } from 'react';
import { usePatients } from '../../hooks/usePatients';
import { useNotification } from '../../context/NotificationContext';

const PatientList: React.FC<PatientListProps> = (props) => {
  // Use custom hook for patient operations
  const { patients, loading, error, loadPatients } = usePatients();
  const { showError } = useNotification();

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Show errors automatically
  useEffect(() => {
    if (error) {
      showError(error.message);
    }
  }, [error, showError]);

  // Render logic...
}
```

### Step 3: Replace Direct IPC Calls with Custom Hooks

**Old Pattern:**
```typescript
// Inside component
const handleCreate = async () => {
  const result = await window.api.patient.create(data);
  if (result.success) {
    // Handle success
  } else {
    // Handle error
  }
}
```

**New Pattern:**
```typescript
import { usePatients } from '../../hooks/usePatients';
import { useNotification } from '../../context/NotificationContext';

const MyComponent = () => {
  const { createPatient } = usePatients();
  const { showSuccess, showError } = useNotification();

  const handleCreate = async () => {
    try {
      await createPatient(data);
      showSuccess('Patient created successfully!');
    } catch (error) {
      showError(error.message);
    }
  }
}
```

### Step 4: Use Atomic Components

Replace HTML elements with reusable components:

**Old:**
```typescript
<button className="button is-primary" onClick={handleClick}>
  Click Me
</button>
```

**New:**
```typescript
import { Button } from '../../components/atoms/Button/Button';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

## Common Migration Patterns

### Pattern 1: Converting State Management

**Old:**
```typescript
class MyComponent extends Component {
  state = { data: null, loading: false };

  async loadData() {
    this.setState({ loading: true });
    const result = await window.api.patient.getAll();
    this.setState({ data: result.data, loading: false });
  }
}
```

**New:**
```typescript
const MyComponent = () => {
  const { patients, loading, loadPatients } = usePatients();

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // patients and loading are automatically managed
}
```

### Pattern 2: Converting Event Handlers

**Old:**
```typescript
class MyComponent extends Component {
  handleClick = () => {
    // Do something
  }

  render() {
    return <button onClick={this.handleClick}>Click</button>
  }
}
```

**New:**
```typescript
const MyComponent = () => {
  const handleClick = useCallback(() => {
    // Do something
  }, []); // Add dependencies if needed

  return <button onClick={handleClick}>Click</button>
}
```

### Pattern 3: Converting Lifecycle Methods

**Old:**
```typescript
class MyComponent extends Component {
  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.loadData();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }
}
```

**New:**
```typescript
const MyComponent = ({ id }) => {
  // componentDidMount + componentDidUpdate
  useEffect(() => {
    loadData();
  }, [id]); // Re-run when id changes

  // componentWillUnmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);
}
```

## Component-by-Component Migration Checklist

### PatientList Component
- [ ] Import `usePatients` hook
- [ ] Import `useNotification` hook
- [ ] Replace `componentDidMount` with `useEffect`
- [ ] Replace state with hook values
- [ ] Replace buttons with `Button` component
- [ ] Add `SearchBar` component
- [ ] Add `LoadingSpinner` component

### PatientNotes Component
- [ ] Import `useNotes` hook
- [ ] Import `useNotification` hook
- [ ] Replace `componentDidMount` with `useEffect`
- [ ] Replace state with hook values
- [ ] Replace buttons with `Button` component
- [ ] Add `LoadingSpinner` component

### PatientForm Component
- [ ] Import `usePatients` hook
- [ ] Import `useNotification` hook
- [ ] Replace form submission logic
- [ ] Use `Input` components for form fields
- [ ] Add form validation

## Testing Your Migration

After migrating each component, test the following:

### Functional Tests
- [ ] Component renders without errors
- [ ] Data loads correctly
- [ ] User interactions work as expected
- [ ] Navigation functions properly
- [ ] Error states display correctly
- [ ] Loading states show appropriately

### Visual Tests
- [ ] Styling is preserved
- [ ] Responsive design works
- [ ] Notifications appear correctly
- [ ] Animations work smoothly

### Performance Tests
- [ ] No unnecessary re-renders
- [ ] Data fetching is efficient
- [ ] UI remains responsive

## Common Issues and Solutions

### Issue 1: "Hook called outside of component"

**Problem:**
```typescript
const data = usePatients(); // Called at top level
```

**Solution:**
```typescript
const MyComponent = () => {
  const data = usePatients(); // Called inside component
}
```

### Issue 2: "Cannot read property of undefined"

**Problem:** Trying to access data before it loads

**Solution:**
```typescript
const { patients, loading } = usePatients();

if (loading) return <LoadingSpinner />;

// Now safe to use patients
return <div>{patients.map(...)}</div>
```

### Issue 3: "Maximum update depth exceeded"

**Problem:** Missing dependencies in useEffect

**Solution:**
```typescript
// Bad
useEffect(() => {
  loadData();
}); // No dependency array - runs on every render

// Good
useEffect(() => {
  loadData();
}, [loadData]); // Runs only when loadData changes
```

### Issue 4: "Context is undefined"

**Problem:** Using context hook outside provider

**Solution:**
```typescript
// Ensure your component is wrapped with the provider
<NotificationProvider>
  <MyComponent /> {/* Can use useNotification here */}
</NotificationProvider>
```

## Rollback Plan

If you encounter issues, you can easily roll back:

1. Keep both old and new files (they have different names)
2. Switch back to old imports if needed
3. Remove new providers from App.tsx
4. Continue using old components

The old code remains functional alongside the new code.

## Best Practices for Migration

1. **Migrate Gradually**: Don't try to migrate everything at once
2. **Test Thoroughly**: Test each component after migration
3. **Keep Old Code**: Don't delete old files until new code is proven
4. **Use TypeScript**: Let TypeScript catch errors early
5. **Follow Patterns**: Use the refactored components as examples
6. **Ask for Help**: Refer to this guide and the refactored code

## Getting Help

If you encounter issues during migration:

1. Check `REFACTORING_SUMMARY.md` for architecture overview
2. Look at refactored components for examples
3. Check TypeScript errors carefully
4. Test in isolation before integrating

## Next Steps

After completing the migration:

1. **Remove Old Code**: Once confident, remove old implementations
2. **Add Tests**: Write unit tests for new components
3. **Optimize Performance**: Use React.memo where appropriate
4. **Enhance Features**: Take advantage of new patterns to add features
5. **Document Changes**: Update team documentation

## Summary

This migration brings significant improvements:
- ✅ Better code organization
- ✅ Improved type safety
- ✅ Enhanced developer experience
- ✅ Easier testing
- ✅ Better error handling
- ✅ More maintainable codebase

Take your time with the migration, and enjoy the benefits of a modern, well-architected application!
