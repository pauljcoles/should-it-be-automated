# Implementation Plan

- [x] 1. Update CSS theme configuration
  - Remove RetroUI color variables (brutal-yellow, brutal-purple, brutal-green, brutal-red)
  - Remove custom shadow utilities (shadow-brutal, shadow-brutal-lg, shadow-brutal-xl)
  - Remove custom border utilities (border-brutal, border-brutal-thick)
  - Remove hover-lift animation utility
  - Add New York theme CSS variables using Tailwind v4 @theme directive
  - _Requirements: 2.1, 2.2_

- [ ]* 1.1 Write property test to verify no brutalist classes remain in source files
  - **Property 1: No brutalist classes in codebase**
  - **Validates: Requirements 2.2**

- [x] 2. Update base UI components
  - _Requirements: 2.2, 2.4, 2.5_

- [x] 2.1 Update Button component (src/components/ui/button.tsx)
  - Replace brutalist styling with New York button variants
  - Remove border-brutal, shadow-brutal, hover-lift classes
  - Update color variants to use semantic colors
  - _Requirements: 2.2, 2.4_

- [x] 2.2 Update Card component (src/components/ui/card.tsx)
  - Remove border-brutal and shadow-brutal-lg classes
  - Use standard Tailwind border and shadow utilities
  - _Requirements: 2.2, 2.5_

- [x] 2.3 Update Input component (src/components/ui/input.tsx)
  - Remove border-brutal and shadow-brutal classes
  - Use standard Tailwind input styling
  - _Requirements: 2.2_

- [x] 2.4 Update other UI components (textarea, select, label, dialog)
  - Remove all brutalist class names from remaining UI components
  - Apply consistent New York theme styling
  - _Requirements: 2.2_

- [x] 3. Update application layout and main components
  - _Requirements: 1.1, 1.4, 2.2, 3.1_

- [x] 3.1 Update App.tsx
  - Replace bg-yellow-50 with bg-background
  - Remove border-brutal-thick class
  - Remove shadow-brutal-xl class
  - Update container styling to use neutral colors
  - _Requirements: 1.1, 1.4, 2.2_

- [x] 3.2 Update Header component (src/components/Header.tsx)
  - Replace bg-yellow-400 with neutral header background
  - Replace border-b-4 border-black with standard border
  - Update button color overrides (bg-blue-400, bg-purple-400, bg-green-400)
  - Remove brutalist styling from drag-and-drop overlay
  - _Requirements: 1.1, 1.4, 2.2, 4.1, 4.2, 4.3_

- [x] 3.3 Update TestCaseTable component
  - Remove any brutalist class names
  - Update table styling to use New York theme
  - Ensure responsive behavior is preserved
  - _Requirements: 2.2, 5.4_

- [x] 3.4 Update ExistingFunctionalitySidebar component
  - Remove any brutalist class names
  - Update sidebar styling to use neutral colors
  - _Requirements: 2.2_

- [x] 4. Update modal and notification components
  - _Requirements: 2.2, 3.5_

- [x] 4.1 Update Notification component
  - Update success/error notification colors to use subtle shades
  - Remove any brutalist styling
  - Ensure notifications still display correctly
  - _Requirements: 2.2, 3.5_

- [x] 4.2 Update HelpModal component
  - Remove brutalist styling from modal
  - Use standard dialog styling
  - _Requirements: 2.2_

- [x] 4.3 Update StateDiagramDiffModal and other modals
  - Remove brutalist styling from all modal components
  - Ensure consistent modal appearance
  - _Requirements: 2.2_

- [ ] 5. Verify configuration and functionality
  - _Requirements: 3.1, 3.3, 3.4, 6.1, 6.3_

- [ ] 5.1 Verify components.json configuration
  - Confirm style is set to "new-york"
  - Confirm baseColor is appropriate (slate recommended)
  - Confirm path aliases are correct
  - _Requirements: 6.1, 6.3_

- [ ]* 5.2 Run existing test suite
  - Execute all existing unit tests
  - Verify all tests pass
  - Update any snapshot tests if needed
  - _Requirements: 3.1, 3.3_

- [ ]* 5.3 Test drag-and-drop functionality
  - Manually test file upload via drag-and-drop
  - Verify functionality works identically to before
  - _Requirements: 3.4_

- [ ]* 5.4 Write property test for responsive behavior
  - **Property 3: Responsive behavior preserved**
  - **Validates: Requirements 5.4**

- [ ] 6. Final cleanup and verification
  - _Requirements: 1.1, 2.1, 2.2_

- [ ] 6.1 Search codebase for remaining brutalist references
  - Search for "brutal" in all source files
  - Search for "yellow-400", "yellow-300", "yellow-50", "purple-400"
  - Remove any remaining references
  - _Requirements: 2.1, 2.2_

- [ ] 6.2 Visual verification checklist
  - Load application and verify professional appearance
  - Check all pages and components render correctly
  - Verify responsive behavior on different screen sizes
  - Confirm no console errors
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 7. Fix scoring model to match Angie Jones' methodology
  - _Requirements: Scoring consistency between Normal and Teaching modes_

- [x] 7.1 Update scoring calculators to use correct Angie Jones model
  - Both Normal and Teaching modes should use the same base scoring (0-100)
  - RISK (max 25): Probability (1-5) × Impact (1-5)
  - VALUE (max 25): Distinctness (1-5) × Induction to Action (1-5)
  - COST EFFICIENCY (max 25): Easy to write (1-5) × Quick to write (1-5)
  - HISTORY (max 25): Bug count (1-5) × Affected areas (1-5)
  - Teaching mode: Legal adds +20 points (total can be 0-120)
  - Normal mode: No legal field (total is 0-100)
  - Update recommendation thresholds: 67-100 = Automate, 34-66 = Maybe, 0-33 = Don't Automate
  - _Requirements: Angie Jones' Risk-Based Testing Model_

- [x] 7.2 Update UI labels and field names to match Angie Jones terminology
  - Rename "Customer Risk" to "RISK"
  - Rename "Value of Test" to "VALUE"
  - Rename "Cost Efficiency" to "COST EFFICIENCY"
  - Rename "History" to "HISTORY"
  - Update field labels: "Impact", "Probability", "Distinctness", "Induction to Action", "Easy to write", "Quick to write", "Bug count", "Affected areas"
  - _Requirements: Angie Jones' Risk-Based Testing Model_

- [x] 7.3 Update help documentation to reflect correct scoring model
  - Update scoring guide in HelpModal to show correct formulas
  - Update decision guide thresholds
  - Add Angie's key notes about History typically scoring low
  - _Requirements: Angie Jones' Risk-Based Testing Model_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
