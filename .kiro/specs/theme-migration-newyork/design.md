# Design Document: Theme Migration to New York

## Overview

This design document outlines the approach for migrating the Test Prioritization Tool from the RetroUI neo-brutalist theme to shadcn/ui's New York theme. The migration will replace bold, playful styling with a refined, professional appearance while maintaining all existing functionality and component structure.

The New York theme is characterized by:
- Subtle shadows and borders
- Neutral color palette (slate/gray base)
- Refined typography with appropriate font weights
- Smooth transitions and interactions
- Professional appearance suitable for enterprise tools

## Architecture

### Theme System

The application uses Tailwind CSS v4 with shadcn/ui components. The theme is defined through:

1. **CSS Variables** - Defined in `src/index.css` using the `@theme` directive
2. **Component Variants** - Defined in individual component files using `class-variance-authority`
3. **Utility Classes** - Custom utilities defined in `src/index.css`
4. **Configuration** - `components.json` specifies the theme style for shadcn CLI

### Migration Strategy

The migration will follow a systematic approach:

1. **Update CSS Variables** - Replace RetroUI color palette with New York theme colors
2. **Remove Custom Utilities** - Remove brutalist-specific utilities (border-brutal, shadow-brutal, hover-lift)
3. **Update Components** - Replace RetroUI styling in all UI components
4. **Update Application Components** - Update Header, App, and other feature components
5. **Verify Functionality** - Ensure all features work identically after styling changes

## Components and Interfaces

### CSS Theme Configuration

**File:** `src/index.css`

**Current State:**
- Custom color variables (brutal-yellow, brutal-purple, etc.)
- Custom shadow utilities (shadow-brutal, shadow-brutal-lg, shadow-brutal-xl)
- Custom border utilities (border-brutal, border-brutal-thick)
- hover-lift animation utility

**Target State:**
- Standard Tailwind color palette using slate as base
- Remove all custom brutalist utilities
- Use standard Tailwind shadow utilities
- Use standard Tailwind transition utilities

### UI Components

**Components to Update:**
- `src/components/ui/button.tsx` - Remove brutalist variants, use New York button styling
- `src/components/ui/card.tsx` - Remove thick borders and hard shadows
- `src/components/ui/input.tsx` - Remove border-brutal and shadow-brutal classes
- `src/components/ui/textarea.tsx` - Remove brutalist styling
- `src/components/ui/select.tsx` - Update to New York styling
- `src/components/ui/dialog.tsx` - Update modal styling
- `src/components/ui/label.tsx` - Update typography

### Application Components

**Components to Update:**
- `src/App.tsx` - Replace bg-yellow-50 with neutral background, remove border-brutal-thick
- `src/components/Header.tsx` - Replace bg-yellow-400 with neutral header, update button colors
- `src/components/TestCaseTable.tsx` - Update table styling
- `src/components/ExistingFunctionalitySidebar.tsx` - Update sidebar styling
- `src/components/Notification.tsx` - Update notification colors
- `src/components/HelpModal.tsx` - Update modal styling
- `src/components/StateDiagramDiffModal.tsx` - Update modal styling

### Color Mapping

**RetroUI → New York:**
- `bg-yellow-400` (header) → `bg-background border-b`
- `bg-yellow-50` (app background) → `bg-background`
- `bg-yellow-300` (hover states) → Standard hover states
- `bg-purple-400` (secondary buttons) → `bg-secondary`
- `bg-green-400` (success/add buttons) → `bg-primary` or keep green for semantic meaning
- `bg-blue-400` (info buttons) → `bg-primary` or keep blue for semantic meaning
- `border-black` → `border-border`
- `text-black` → `text-foreground`

## Data Models

No data model changes required. This is a pure styling migration.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: No brutalist classes in codebase

*For any* source file in the project (excluding node_modules), the file content should not contain any RetroUI-specific class names (border-brutal, border-brutal-thick, shadow-brutal, shadow-brutal-lg, shadow-brutal-xl, hover-lift, bg-yellow-400, bg-yellow-300, bg-yellow-50, bg-purple-400).

**Validates: Requirements 2.2**

### Property 2: Existing functionality preserved

*For any* user interaction that worked before the migration, the same interaction should produce the same functional result after the migration (though visual appearance may differ).

**Validates: Requirements 3.1, 3.3**

**Note:** This property is best validated by ensuring all existing unit and integration tests continue to pass after the migration.

### Property 3: Responsive behavior preserved

*For any* viewport size that was supported before the migration, the application should remain functional and properly laid out at that viewport size after the migration.

**Validates: Requirements 5.4**

## Error Handling

No new error handling required. All existing error handling should continue to function identically.

## Testing Strategy

### Unit Testing

Since this is primarily a styling migration, traditional unit tests are less applicable. However, we should:

1. **Verify existing tests pass** - Run all existing unit tests to ensure functionality is preserved
2. **Snapshot tests** (if they exist) - Update snapshots to reflect new styling
3. **Component rendering tests** - Ensure components render without errors

### Property-Based Testing

We will use **fast-check** (already in the project) for property-based testing.

**Property Test 1: No brutalist classes in source files**
- Generate: List of all source files (src/**/*.{ts,tsx,css})
- Test: For each file, verify it doesn't contain brutalist class names
- Iterations: Run once per file (not randomized)
- Tag: `**Feature: theme-migration-newyork, Property 1: No brutalist classes in codebase**`

**Property Test 2: Existing functionality preserved**
- This will be validated by running the existing test suite
- No new property test needed - existing tests serve this purpose

**Property Test 3: Responsive behavior preserved**
- Generate: Random viewport widths (320px to 1920px)
- Test: Verify application renders without layout errors at each width
- Iterations: 100
- Tag: `**Feature: theme-migration-newyork, Property 3: Responsive behavior preserved**`

### Manual Testing Checklist

After migration, manually verify:

1. ✓ Application loads without console errors
2. ✓ All buttons are clickable and functional
3. ✓ Forms accept input and validate correctly
4. ✓ Drag-and-drop file upload works
5. ✓ Modals open and close correctly
6. ✓ Notifications display correctly
7. ✓ Responsive layout works on mobile, tablet, and desktop
8. ✓ Visual appearance is professional and consistent

## Implementation Notes

### Tailwind v4 Considerations

The project uses Tailwind CSS v4, which has a different configuration approach than v3:
- Theme configuration is done in CSS using `@theme` directive
- No separate `tailwind.config.js` file
- CSS variables are defined directly in `src/index.css`

### Component Update Pattern

For each component, follow this pattern:

1. **Identify brutalist classes** - Search for border-brutal, shadow-brutal, hover-lift, bright colors
2. **Replace with New York equivalents** - Use standard Tailwind utilities
3. **Test rendering** - Verify component renders correctly
4. **Check functionality** - Ensure interactive elements still work

### Color Semantic Preservation

Some colors have semantic meaning and should be preserved:
- **Green** for success/add actions - Keep but use more subtle shade
- **Red** for destructive/error actions - Keep but use more subtle shade
- **Blue** for informational actions - Keep but use more subtle shade

Replace only the non-semantic bright colors (yellow header, purple secondary).

### Migration Order

Recommended order to minimize visual disruption:

1. Update CSS variables and remove custom utilities
2. Update base UI components (button, card, input)
3. Update application layout (App.tsx)
4. Update Header component
5. Update feature components (table, sidebar, modals)
6. Final verification and cleanup
