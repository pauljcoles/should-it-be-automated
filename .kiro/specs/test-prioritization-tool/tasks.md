# Implementation Plan

- [x] 1. Set up project structure and core dependencies
  - Create React application with TypeScript
  - Install Tailwind CSS for styling
  - Set up fast-check for property-based testing
  - Configure build and development environment
  - Create directory structure: components/, services/, types/, utils/
  - _Requirements: All_

- [x] 2. Implement core data models and types
  - [x] 2.1 Define TypeScript interfaces for TestCase, Scores, ExistingFunctionality, StateDiagram, State, StateDiff
    - Create types/models.ts with all interface definitions
    - Include enums for ChangeType, ImplementationType, Recommendation
    - _Requirements: 14.2, 14.3_

  - [ ]* 2.2 Write property test for data model serialization
    - **Property 13: State serialization round-trip**
    - **Validates: Requirements 3.2**

- [x] 3. Implement score calculation engine
  - [x] 3.1 Create ScoreCalculator service class
    - Implement calculateRiskScore method
    - Implement calculateValueScore method with distinctness and induction to action logic
    - Implement calculateEaseScore method
    - Implement calculateHistoryScore method
    - Implement calculateLegalScore method
    - Implement calculateTotalScore method
    - Implement getRecommendation method
    - Implement explainScore method for tooltips
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 3.2 Write property test for risk score calculation
    - **Property 5: Risk score calculation correctness**
    - **Validates: Requirements 2.1**

  - [ ]* 3.3 Write property test for value score calculation
    - **Property 6: Value score calculation correctness**
    - **Validates: Requirements 2.2**

  - [ ]* 3.4 Write property test for ease score calculation
    - **Property 7: Ease score calculation correctness**
    - **Validates: Requirements 2.3**

  - [ ]* 3.5 Write property test for history score calculation
    - **Property 8: History score calculation correctness**
    - **Validates: Requirements 2.4**

  - [ ]* 3.6 Write property test for legal score calculation
    - **Property 9: Legal score binary correctness**
    - **Validates: Requirements 2.5**

  - [ ]* 3.7 Write property test for total score calculation
    - **Property 10: Total score is sum of components**
    - **Validates: Requirements 2.6**

  - [ ]* 3.8 Write property test for recommendation tier logic
    - **Property 11: Recommendation tier correctness**
    - **Validates: Requirements 2.7, 2.8, 2.9**

- [x] 4. Implement state management with React Context
  - [x] 4.1 Create AppContext with state structure
    - Define AppState interface
    - Create context provider component
    - Implement state update actions (addTestCase, updateTestCase, deleteTestCase, etc.)
    - Implement filter and sort state management
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 4.2 Write property test for row addition
    - **Property 1: Row addition increases test case count**
    - **Validates: Requirements 1.1**

  - [ ]* 4.3 Write property test for row deletion
    - **Property 2: Row deletion decreases test case count**
    - **Validates: Requirements 1.2**

  - [ ]* 4.4 Write property test for row duplication
    - **Property 3: Duplication preserves field values**
    - **Validates: Requirements 1.3**

  - [ ]* 4.5 Write property test for field updates
    - **Property 4: Field updates are immediately reflected**
    - **Validates: Requirements 1.4**

- [x] 5. Implement localStorage persistence
  - [x] 5.1 Create StorageService class
    - Implement saveAppState with debouncing (500ms)
    - Implement loadAppState
    - Implement saveStateDiagram with version management
    - Implement loadStateDiagramHistory
    - Implement getLatestStateDiagram
    - Implement clearAllData
    - Handle storage quota errors
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 15.1, 15.2, 15.5_

  - [ ]* 5.2 Write property test for state persistence round-trip
    - **Property 24: State persistence round-trip**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 5.3 Write property test for clear data functionality
    - **Property 25: Clear data removes all localStorage entries**
    - **Validates: Requirements 4.5**

  - [ ]* 5.4 Write property test for state diagram storage key pattern
    - **Property 51: State diagram storage key pattern correctness**
    - **Validates: Requirements 15.1**

  - [ ]* 5.5 Write property test for version limit enforcement
    - **Property 52: State diagram version limit enforcement**
    - **Validates: Requirements 15.2, 15.5**

- [x] 6. Implement state diagram processing
  - [x] 6.1 Create StateDiagramService class
    - Implement parseStateDiagram method
    - Implement validateStateDiagram method
    - Implement diffStateDiagrams method with change detection algorithm
    - Implement generateTestCases method
    - Implement calculateAffectedAreas method
    - Implement detectChangeType method
    - _Requirements: 3A.1, 3A.2, 3A.3, 3A.4, 3A.5, 3A.6, 3A.7, 3A.8_

  - [ ]* 6.2 Write property test for state diagram parsing
    - **Property 16: State diagram parsing completeness**
    - **Validates: Requirements 3A.1**

  - [ ]* 6.3 Write property test for state diagram diff algorithm
    - **Property 17: State diagram diff correctness**
    - **Validates: Requirements 3A.2**

  - [ ]* 6.4 Write property test for new state test case generation
    - **Property 18: New state generates correct test case**
    - **Validates: Requirements 3A.3**

  - [ ]* 6.5 Write property test for modified state test case generation
    - **Property 19: Modified state generates correct test case**
    - **Validates: Requirements 3A.4**

  - [ ]* 6.6 Write property test for affected areas calculation
    - **Property 20: Affected areas calculation from transitions**
    - **Validates: Requirements 3A.5**

  - [ ]* 6.7 Write property test for field mapping
    - **Property 21: State diagram field mapping correctness**
    - **Validates: Requirements 3A.6**

  - [ ]* 6.8 Write property test for diff summary counts
    - **Property 22: Diff summary counts correctness**
    - **Validates: Requirements 3A.7**

  - [ ]* 6.9 Write property test for import test case count
    - **Property 23: Import creates correct number of test cases**
    - **Validates: Requirements 3A.8**

- [-] 7. Implement validation and smart suggestions
  - [x] 7.1 Create ValidationService class
    - Implement getValidationWarnings method
    - Implement validateTestCase method
    - Implement validateStateDiagram method
    - Implement smart suggestion logic for unchanged high-frequency tests
    - Implement smart suggestion logic for low-scoring loop components
    - Implement smart suggestion logic for legal requirements
    - Implement state diagram validation (unreachable states, dead ends, invalid transitions)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]* 7.2 Write property test for unchanged high-frequency validation
    - **Property 42: Smart validation for unchanged high-frequency tests**
    - **Validates: Requirements 9.3**

  - [ ]* 7.3 Write property test for low-scoring loop component validation
    - **Property 43: Smart validation for low-scoring loop components**
    - **Validates: Requirements 9.4**

  - [ ]* 7.4 Write property test for legal requirement validation
    - **Property 44: Smart validation for legal requirements**
    - **Validates: Requirements 9.5**

  - [ ]* 7.5 Write property test for unreachable state detection
    - **Property 45: State diagram validation for unreachable states**
    - **Validates: Requirements 9.6**

  - [ ]* 7.6 Write property test for dead-end state detection
    - **Property 46: State diagram validation for dead-end states**
    - **Validates: Requirements 9.7**

  - [ ]* 7.7 Write property test for invalid transition detection
    - **Property 47: State diagram validation for invalid transitions**
    - **Validates: Requirements 9.8**

- [x] 8. Build core UI components
  - [x] 8.1 Create Header component
    - Implement UploadButton with file picker and drag-and-drop
    - Implement DownloadButton with JSON export
    - Implement AddRowButton
    - Implement HelpButton
    - _Requirements: 3.1, 3.3, 1.1_

  - [x] 8.2 Create TestCaseRow component
    - Implement inline editable cells for all fields
    - Implement dropdown selects for changeType and implementationType
    - Implement number inputs/sliders for risk factors
    - Implement checkbox for legal requirement
    - Implement read-only score cells with color coding
    - Implement RecommendationBadge with color coding
    - Implement action buttons (delete, duplicate, copy decision)
    - Use React.memo for performance optimization
    - _Requirements: 1.2, 1.3, 1.4, 14.1, 14.2, 14.3, 14.4, 14.5, 7.1, 7.2, 7.3_

  - [x] 8.3 Create TestCaseTable component
    - Implement table header with sortable columns
    - Implement table body with TestCaseRow components
    - Implement virtualization for 100+ rows (react-window)
    - Implement TableFilters component
    - Implement SummaryStats component at bottom
    - _Requirements: 6.1, 6.2, 8.1, 8.2, 8.3, 8.4, 8.5, 13.1_

  - [ ]* 8.4 Write property test for column sorting
    - **Property 32: Column sorting correctness**
    - **Validates: Requirements 6.1**

  - [ ]* 8.5 Write property test for sort toggle
    - **Property 33: Sort toggle reverses order**
    - **Validates: Requirements 6.2**

  - [ ]* 8.6 Write property test for recommendation filter
    - **Property 34: Recommendation filter correctness**
    - **Validates: Requirements 6.3**

  - [ ]* 8.7 Write property test for search filter
    - **Property 35: Search filter correctness**
    - **Validates: Requirements 6.4**

  - [ ]* 8.8 Write property test for multiple filters
    - **Property 36: Multiple filters are ANDed**
    - **Validates: Requirements 6.5**

  - [ ]* 8.9 Write property test for summary statistics
    - **Property 37: Summary statistics count correctness**
    - **Property 38: Recommendation category counts correctness**
    - **Property 39: Average score calculation correctness**
    - **Property 40: Legal requirement count correctness**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [ ]* 8.10 Write property test for filtered statistics
    - **Property 41: Filtered statistics correctness**
    - **Validates: Requirements 8.5**

- [x] 9. Build existing functionality sidebar
  - [x] 9.1 Create ExistingFunctionalitySidebar component
    - Implement collapsible sidebar
    - Implement SearchBox for filtering
    - Implement FunctionalityList with entries
    - Implement AddFunctionalityButton
    - Implement edit and delete functionality
    - Display source badges (manual vs state-diagram)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 9.2 Write property test for adding existing functionality
    - **Property 26: Adding existing functionality increases count**
    - **Validates: Requirements 5.2**

  - [ ]* 9.3 Write property test for editing existing functionality
    - **Property 27: Editing existing functionality updates state**
    - **Validates: Requirements 5.3**

  - [ ]* 9.4 Write property test for deleting existing functionality
    - **Property 28: Deleting existing functionality decreases count**
    - **Validates: Requirements 5.4**

  - [ ]* 9.5 Write property test for search filtering
    - **Property 29: Search filters existing functionality correctly**
    - **Validates: Requirements 5.5**

  - [ ]* 9.6 Write property test for state diagram import population
    - **Property 30: State diagram import populates existing functionality**
    - **Validates: Requirements 5.6**

  - [ ]* 9.7 Write property test for source tracking
    - **Property 31: Existing functionality source tracking**
    - **Validates: Requirements 5.7**

- [x] 10. Implement state diagram import UI
  - [x] 10.1 Create StateDiagramDiffModal component
    - Implement DiffSummary showing counts of changes
    - Implement ChangesList showing detailed changes
    - Implement ImportControls with confirm/cancel buttons
    - Display visual diff with color coding (added=green, removed=red, modified=yellow)
    - _Requirements: 3A.7, 3A.8_

  - [x] 10.2 Integrate state diagram upload flow
    - Detect JSON format type on upload
    - Trigger diff calculation for state diagrams
    - Show diff modal before import
    - Generate test cases on confirmation
    - Populate existing functionality list
    - _Requirements: 3.1, 3A.1, 3A.2, 3A.3, 3A.4, 3A.8_

  - [ ]* 10.3 Write property test for JSON format detection
    - **Property 12: JSON format detection correctness**
    - **Validates: Requirements 3.1**

- [x] 11. Implement JSON import/export functionality
  - [x] 11.1 Create ImportExportService class
    - Implement exportToJSON method with filename generation
    - Implement importFromJSON method with validation
    - Implement copyToClipboard method
    - Handle file reading and download
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [ ]* 11.2 Write property test for export filename pattern
    - **Property 14: Export filename pattern correctness**
    - **Validates: Requirements 3.3**

  - [ ]* 11.3 Write property test for serialized JSON structure
    - **Property 15: Serialized JSON contains required fields**
    - **Validates: Requirements 3.5**

- [x] 12. Implement BERT integration
  - [x] 12.1 Create BERTIntegrationService class
    - Implement parseBERTJSON method
    - Implement mapBERTFieldsToTestCase method
    - Implement formatDecisionForCopy method
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 12.2 Add "Paste from BERT" button to UI
    - Implement clipboard reading
    - Parse BERT JSON
    - Create new test case with pre-filled fields
    - _Requirements: 11.1, 11.2_

  - [x] 12.3 Add "Copy Decision" button to TestCaseRow
    - Format decision text
    - Copy to clipboard
    - Show success notification
    - _Requirements: 11.3_

  - [ ]* 12.4 Write property test for BERT JSON parsing
    - **Property 48: BERT JSON parsing correctness**
    - **Validates: Requirements 11.1, 11.2**

  - [ ]* 12.5 Write property test for copy decision format
    - **Property 49: Copy decision format correctness**
    - **Validates: Requirements 11.3**

  - [ ]* 12.6 Write property test for BERT field mapping
    - **Property 50: BERT field mapping correctness**
    - **Validates: Requirements 11.4, 11.5**

- [x] 13. Implement help and documentation
  - [x] 13.1 Create HelpModal component
    - Implement tab navigation (Quick Start, Scoring Guide, Best Practices, FAQ)
    - Create content for each tab
    - Include examples with scoring rationale
    - _Requirements: 10.4, 10.5_

  - [x] 13.2 Create TooltipProvider component
    - Implement tooltip system for info icons
    - Add tooltips for all field labels
    - Add tooltips for score cells with formulas
    - Add tooltips for recommendation badges
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 14. Implement responsive design
  - [x] 14.1 Add responsive styles with Tailwind CSS
    - Implement desktop layout (full table, sidebar visible)
    - Implement tablet layout (horizontal scroll, collapsible sidebar)
    - Implement mobile-friendly touch interactions
    - Test on various screen sizes
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 15. Implement state diagram version history UI
  - [x] 15.1 Create StateDiagramHistoryModal component
    - Display list of previous versions with timestamps
    - Implement version selection for comparison
    - Show diff between selected versions
    - _Requirements: 15.3, 15.4_

  - [ ]* 15.2 Write property test for history completeness
    - **Property 53: State diagram history completeness**
    - **Validates: Requirements 15.3**

  - [ ]* 15.3 Write property test for version comparison
    - **Property 54: State diagram version comparison correctness**
    - **Validates: Requirements 15.4**

- [x] 16. Add error handling and user feedback
  - [x] 16.1 Implement error boundary component
    - Catch React errors
    - Display user-friendly error messages
    - Provide recovery options

  - [x] 16.2 Add validation error displays
    - Show inline errors for required fields
    - Show warnings for smart suggestions
    - Show errors for invalid JSON imports
    - Show errors for state diagram validation failures
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [x] 16.3 Add success notifications
    - Show notification on successful import
    - Show notification on successful export
    - Show notification on successful copy to clipboard

  - [x] 16.4 Handle storage errors gracefully
    - Catch quota exceeded errors
    - Catch access denied errors
    - Display appropriate error messages with solutions

- [x] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Polish and optimization
  - [ ] 18.1 Optimize performance
    - Implement React.memo for expensive components
    - Implement useMemo for expensive calculations
    - Implement useCallback for event handlers
    - Add virtualization for large lists
    - Profile and optimize render performance
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ] 18.2 Add keyboard shortcuts
    - Implement Tab/Enter navigation between fields
    - Implement Ctrl+N for new row
    - Implement Ctrl+S for export
    - Implement Escape to close modals
    - _Requirements: 1.5_

  - [ ] 18.3 Improve accessibility
    - Add ARIA labels to all interactive elements
    - Ensure keyboard navigation works throughout
    - Test with screen readers
    - Ensure color contrast meets WCAG standards

  - [ ] 18.4 Add loading states
    - Show spinner during file upload
    - Show spinner during diff calculation
    - Show spinner during export
    - Disable buttons during async operations

- [ ] 19. Final testing and bug fixes
  - [ ] 19.1 Run all property-based tests
    - Verify all 54 properties pass with 100+ iterations
    - Fix any failing tests
    - Document any edge cases discovered

  - [ ]* 19.2 Run integration tests
    - Test complete manual entry workflow
    - Test state diagram import workflow
    - Test BERT integration workflow
    - Test filter and sort combinations
    - Test localStorage persistence across page reloads

  - [x] 19.3 Browser compatibility testing
    - Test on Chrome, Firefox, Safari, Edge
    - Test localStorage behavior
    - Test clipboard API
    - Fix any browser-specific issues

  - [ ] 19.4 Performance testing
    - Benchmark score calculation with 100 test cases
    - Benchmark state diagram diff with 50 states
    - Benchmark JSON export with 100 test cases
    - Benchmark table render with 100 rows
    - Verify all performance targets are met

- [x] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Deployment preparation
  - [x] 21.1 Build production bundle
    - Run production build
    - Verify bundle size is reasonable
    - Test production build locally

  - [x] 21.2 Create deployment documentation
    - Document deployment steps
    - Document environment requirements
    - Create user guide
    - Create developer guide

  - [x] 21.3 Deploy to static hosting
    - Deploy to Netlify or GitHub Pages
    - Verify deployed application works
    - Test all functionality in production
    - Share URL with team


- [-] 22. Add Initial Judgment (Gut Feel) feature
  - [x] 22.1 Add initialJudgment field to TestCase model
    - Add optional field: 'definitely-automate' | 'probably-automate' | 'unsure' | 'probably-skip' | 'definitely-skip'
    - Update TypeScript interfaces in types/models.ts
    - _Requirements: New feature for bias detection and learning_

  - [x] 22.2 Add Initial Judgment input to TestCaseRow
    - Add dropdown/radio buttons for initial judgment selection
    - Position before scoring fields (to capture instinct first)
    - Make it optional/skippable
    - Add tooltip explaining the purpose
    - _Requirements: New feature_

  - [x] 22.3 Add judgment comparison display
    - Show comparison after score is calculated
    - Display warning icon when gut feel doesn't match recommendation
    - Add explanation of why the judgment differed
    - Track accuracy over time (optional)
    - _Requirements: New feature_

  - [x] 22.4 Add collapsible/hideable option for experienced users
    - Add setting to hide initial judgment column
    - Store preference in localStorage
    - Allow quick toggle in settings
    - _Requirements: New feature_

  - [ ]* 22.5 Write tests for initial judgment feature
    - Test judgment comparison logic
    - Test UI rendering with different judgment values
    - Test localStorage persistence of preference
    - _Requirements: New feature_

  - [x] 22.6 Update documentation
    - Add section to USER_GUIDE.md explaining gut feel feature
    - Include examples of when gut feel was wrong
    - Explain the learning value
    - Update HelpModal with gut feel explanation
    - _Requirements: New feature_

- [ ] 23. Convert state diagram format to XState standard (breaking change)
  - [ ] 23.1 Research XState format specification
    - Review XState JSON schema documentation
    - Document XState structure (states, on, initial, meta)
    - Plan how to store testing metadata in 'meta' property
    - Document migration from current format
    - _Requirements: Industry standard alignment_

  - [ ] 23.2 Update StateDiagram interface to XState format
    - Replace 'transitions' with 'on' property (XState standard)
    - Add 'initial' state property
    - Add 'meta' property for testing metadata (implementation, lastModified, changeNotes)
    - Remove 'actions' array (use 'on' keys instead)
    - Update TypeScript types in types/models.ts
    - _Requirements: Industry standard alignment_

  - [ ] 23.3 Update StateDiagramService to parse XState format
    - Update parseStateDiagram to expect XState structure
    - Parse 'on' property for transitions
    - Extract testing metadata from 'meta' property
    - Update validation to check XState schema
    - Remove support for old custom format
    - _Requirements: Industry standard alignment_

  - [ ] 23.4 Update state diagram diff and generation logic
    - Update diffStateDiagrams to work with XState format
    - Update generateTestCases to read from 'on' transitions
    - Update calculateAffectedAreas for XState structure
    - Update all state diagram processing functions
    - _Requirements: Industry standard alignment_

  - [ ] 23.5 Update example state diagrams to XState format
    - Convert example-state-diagram.json to XState format
    - Update all test fixtures to XState format
    - Update documentation examples
    - _Requirements: Industry standard alignment_

  - [ ]* 23.6 Write tests for XState format
    - Update all StateDiagramService tests for XState format
    - Test parsing XState format
    - Test export to XState format
    - Test round-trip conversion
    - Test compatibility with Stately Studio exports
    - _Requirements: Industry standard alignment_

  - [ ] 23.7 Add XState branding and links
    - Add "Powered by XState" badge/mention
    - Link to XState documentation in help
    - Link to Stately Studio for visual editing
    - Add tooltip explaining XState benefits
    - _Requirements: Industry standard alignment_


- [ ] 24. Implement accessibility testing and remediation with axe-core
  - [ ] 24.1 Set up axe-core for automated accessibility testing
    - Install axe-core and @axe-core/react
    - Install vitest-axe for test integration
    - Configure axe-core in test setup
    - Add axe-core to development environment for runtime checking
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.2 Run initial accessibility audit
    - Run axe-core against all components
    - Document all accessibility violations
    - Categorize by severity (critical, serious, moderate, minor)
    - Prioritize fixes based on impact
    - Create accessibility violation report
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.3 Fix critical accessibility issues
    - Fix missing form labels
    - Fix missing ARIA labels on interactive elements
    - Fix keyboard navigation issues
    - Fix focus management problems
    - Fix color contrast issues
    - Ensure all images have alt text
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.4 Fix semantic HTML issues
    - Replace divs with proper semantic elements (button, nav, main, etc.)
    - Ensure proper heading hierarchy (h1, h2, h3)
    - Add landmark regions (header, main, nav, aside)
    - Fix table accessibility (proper headers, captions)
    - Ensure form structure is accessible
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.5 Implement keyboard navigation improvements
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - Implement proper tab order
    - Add keyboard shortcuts documentation
    - Test with keyboard-only navigation
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.6 Add ARIA attributes where needed
    - Add aria-label to icon-only buttons
    - Add aria-describedby for form field hints
    - Add aria-live regions for dynamic content
    - Add aria-expanded for collapsible sections
    - Add aria-sort for sortable table columns
    - Add role attributes where semantic HTML isn't sufficient
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.7 Fix modal and dialog accessibility
    - Implement focus trapping in modals
    - Return focus to trigger element on close
    - Add aria-modal and role="dialog"
    - Ensure Escape key closes modals
    - Add proper modal titles with aria-labelledby
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.8 Improve screen reader experience
    - Test with NVDA (Windows) and VoiceOver (Mac)
    - Add screen reader only text where needed
    - Ensure dynamic content changes are announced
    - Fix reading order issues
    - Add skip links for navigation
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.9 Add automated accessibility tests
    - Write axe tests for all major components
    - Add axe tests to component test suites
    - Set up CI/CD to fail on accessibility violations
    - Add accessibility regression tests
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.10 Create accessibility documentation
    - Document keyboard shortcuts
    - Create accessibility statement
    - Add accessibility section to USER_GUIDE.md
    - Document screen reader compatibility
    - Add accessibility testing guide to DEVELOPER_GUIDE.md
    - _Requirements: WCAG 2.1 AA compliance_

  - [ ] 24.11 Verify WCAG 2.1 AA compliance
    - Run final axe-core audit
    - Verify all critical and serious issues are fixed
    - Test with assistive technologies
    - Document any remaining minor issues
    - Create accessibility compliance report
    - _Requirements: WCAG 2.1 AA compliance_


- [ ] 25. Update documentation to reflect XState format as standard
  - [ ] 25.1 Update README.md
    - Change "State Diagram Integration" description to mention XState format
    - Add XState as a key feature/technology
    - Link to XState documentation
    - Remove references to custom format
    - _Requirements: Documentation accuracy_

  - [ ] 25.2 Update USER_GUIDE.md
    - Update State Diagram Integration section to show XState format
    - Replace example JSON with XState format
    - Add explanation of XState benefits (visual editors, testing tools)
    - Link to Stately Studio for visual editing
    - Link to @xstate/test for automated test generation
    - Remove references to custom format
    - _Requirements: Documentation accuracy_

  - [ ] 25.3 Update HelpModal.tsx
    - Update FAQ section about state diagrams
    - Show XState format example instead of custom format
    - Explain XState compatibility and benefits
    - Add links to XState resources
    - Mention Stately Studio integration
    - _Requirements: Documentation accuracy_

  - [ ] 25.4 Update STATE_DIAGRAM_IMPORT.md
    - Rewrite to focus on XState format
    - Show complete XState JSON example
    - Explain XState structure (states, on, initial, meta)
    - Document how testing metadata goes in 'meta' property
    - Add examples of importing from Stately Studio
    - Remove custom format documentation
    - _Requirements: Documentation accuracy_

  - [ ] 25.5 Update DEVELOPER_GUIDE.md
    - Update StateDiagram interface documentation to show XState format
    - Update code examples to use XState structure
    - Add section on XState compatibility
    - Document 'meta' property for testing extensions
    - Remove custom format references
    - _Requirements: Documentation accuracy_

  - [ ] 25.6 Update design.md specification
    - Update StateDiagram interface to XState format
    - Update all examples to use XState structure
    - Document XState extensions in 'meta' property
    - Update property-based test examples
    - Remove custom format from spec
    - _Requirements: Documentation accuracy_

  - [ ] 25.7 Add XState resources section
    - Create XSTATE_INTEGRATION.md guide
    - Document how to use Stately Studio to create diagrams
    - Document how to export from Stately Studio
    - Document how to use @xstate/test for test generation
    - Add troubleshooting section
    - Include video/screenshot tutorials
    - _Requirements: Documentation accuracy_


- [-] 26. UI/UX Improvements and Scoring Model Refinement
  - [x] 26.1 Move Initial Judgment (Gut Feel) column to be first
    - Reorder table columns so Gut Feel appears immediately after Test Name
    - Update column header order in TestCaseTable
    - Update cell order in TestCaseRow
    - Update mobile card view to show Gut Feel near the top
    - Rationale: Capture instinct before seeing any other fields
    - _Requirements: UX improvement for bias detection_

  - [x] 26.2 Apply Neo-Brutalist design to desktop test case rows
    - Add bold black borders (border-brutal) to table cells
    - Increase border thickness between rows (border-4)
    - Add shadow effects to input fields (shadow-brutal)
    - Use high-contrast colors for better visual hierarchy
    - Add subtle hover effects with border emphasis
    - Ensure consistency with existing Neo-Brutalist header design
    - Test on various screen sizes to ensure readability
    - _Requirements: Design consistency and visual appeal_

  - [x] 26.3 Replace Implementation Type with Angie's Effort Model
    - Remove "Implementation Type" dropdown field from TestCase model
    - Add two new fields to TestCase interface:
      - `easyToAutomate: number` (1-5 slider)
      - `quickToAutomate: number` (1-5 slider)
    - Update ScoreCalculator to use new effort calculation:
      - `effortScore = easyToAutomate × quickToAutomate` (0-25)
    - Update TestCaseRow component:
      - Replace Implementation Type dropdown with two sliders
      - Add labels: "Easy to Automate?" and "Quick to Automate?"
      - Add tooltips explaining the scale (1=very difficult/slow, 5=very easy/fast)
    - Update all existing test cases to migrate from implementationType to effort scores
    - _Requirements: Align with Angie Jones' actual methodology_

  - [x] 26.4 Update field labels and terminology for clarity
    - Rename "User Frequency" to "Usage Frequency" or "How Often Used?"
    - Rename "Business Impact" to "Impact if Broken"
    - Rename "Affected Areas" to "Connected Components"
    - Add helper text/tooltips for each field explaining what to consider
    - Update all documentation to reflect new terminology
    - _Requirements: Reduce confusion and improve usability_

  - [x] 26.5 Update score calculation display
    - Rename "Ease Score" to "Effort Score" in UI
    - Update score tooltips to explain new calculation
    - Update HelpModal scoring guide with new effort model
    - Add examples showing how to rate easy/quick values
    - _Requirements: Clarity and alignment with Angie's model_

  - [ ] 26.6 Create migration utility for existing data
    - Write function to convert old implementationType to effort scores:
      - 'standard-components' → easy: 5, quick: 5
      - 'new-pattern' → easy: 3, quick: 3
      - 'custom-implementation' → easy: 1, quick: 2
      - 'hybrid' → easy: 2, quick: 3
    - Add migration on app load if old format detected
    - Show notification to user about data migration
    - _Requirements: Backward compatibility_

  - [ ]* 26.7 Update tests for new effort model
    - Update ScoreCalculator tests for new effort calculation
    - Update TestCase interface tests
    - Update component tests for new slider inputs
    - Update property-based tests if needed
    - _Requirements: Test coverage_

  - [ ] 26.8 Update documentation for new scoring model
    - Update USER_GUIDE.md with new effort model explanation
    - Update HelpModal with examples of easy/quick ratings
    - Add FAQ about the change from implementation types
    - Update design.md specification
    - Include examples: "TV-first modal" scenario
    - _Requirements: User education_



- [x] 27. ~~Implement "Did Code Change?" field and Organisational Pressure with Real Talk teaching~~ (OBSOLETE - Superseded by Task 31)
  - [x] 27.1 Replace Change Type with "Did Code Change?" field
    - Remove existing `changeType` field from TestCase model
    - Add new field: `codeChange: 'new' | 'modified' | 'ui-only' | 'unchanged'`
    - Update TestCaseRow component to replace dropdown with new options:
      - "Yes - New (never existed before)"
      - "Yes - Modified (behaviour/logic changed)"
      - "Yes - UI only (styling/layout changed)"
      - "No - Unchanged (works the same way)"
    - Add prominent help text: "💡 If unchanged, you probably don't need to test it again!"
    - Auto-set distinctness based on code change:
      - new → 5 (maximum new information)
      - modified → 4 (significant new information)
      - ui-only → 2 (some new information)
      - unchanged → 0 (provides NO new information)
    - _Requirements: Teaching risk-based testing principle_

  - [x] 27.2 Add Organisational Pressure field
    - Add new field to TestCase model: `organisationalPressure: number` (1-5 slider)
    - Add slider to TestCaseRow component after Legal Requirement
    - Add label: "Organisational Pressure"
    - Add tooltip explaining:
      - 1 = No pressure, team decides
      - 3 = Some stakeholder anxiety
      - 5 = High pressure, must show coverage
    - Store in localStorage with other test case data
    - _Requirements: Acknowledge organisational reality_

  - [ ] 27.3 Update scoring to separate Technical and Organisational recommendations
    - Keep existing Technical Score calculation (0-100)
    - Technical Score = Risk + Value + Effort + History + Legal
    - Technical Recommendation (always shown):
      - 67-100: ✅ AUTOMATE (Green)
      - 34-66: ⚠️ MAYBE (Yellow)
      - 0-33: ❌ DON'T AUTOMATE (Red)
    - Add Organisational Recommendation logic (conditional):
      - Only shown when organisationalPressure ≥ 3
      - Logic:
        - High Pressure (≥3) + Low Technical Score (<34) + Unchanged → Show Real Talk (ONE SMOKE TEST)
        - High Pressure (≥3) + High Technical Score (≥67) → Show "AUTOMATE - COMPREHENSIVE ✅"
        - High Pressure (≥3) + Medium Score (34-66) → Show "MAYBE - evaluate stakeholder needs ⚠️"
      - Display as separate section below Technical Recommendation
    - Update ScoreCalculator service with new logic
    - _Requirements: Honest technical scoring + pragmatic guidance_

  - [ ] 27.4 Add "Unchanged Code" warning
    - When user selects codeChange = 'unchanged', show inline warning:
      ```
      ⚠️ UNCHANGED CODE DETECTED
      
      This functionality hasn't changed. Consider:
      - Do existing tests already cover this?
      - Is this truly NEW risk?
      - Are you duplicating coverage unnecessarily?
      
      💡 Risk-based testing means: Test what CHANGED, not what's 
         reachable via a new route.
      ```
    - Display below the "Did Code Change?" field
    - Use warning color (yellow/amber)
    - Make dismissible but show by default
    - _Requirements: Active teaching at point of decision_

  - [ ] 27.5 Implement "Real Talk" teaching section
    - Create RealTalkSection component
    - Display when ALL conditions met:
      - Technical Score < 34 (DON'T AUTOMATE)
      - organisationalPressure ≥ 3 (stakeholder anxiety)
      - codeChange === 'unchanged' OR (codeChange === 'ui-only' AND technicalScore < 34)
    - Show distinctive "💭 REAL TALK" header
    - Display message:
      ```
      Technically, you don't need this test. The [feature name] code didn't change.
      
      But we know how organisations work. Sometimes you need to show "the new thing 
      works end-to-end" even when that's not where the risk is.
      
      Our advice:
      ✓ Write ONE smoke test as organisational insurance
      ✗ Don't write comprehensive coverage for unchanged code
      
      Then spend your time on what matters: [list high-scoring tests from session]
      ```
    - Dynamically fill in:
      - [feature name] = test name from current row
      - [list high-scoring tests] = other tests in session with score ≥67
    - Make section always visible (not collapsible) - this is the teaching moment
    - Style with distinct background colour to draw attention
    - _Requirements: Teaching pragmatic risk-based testing_

  - [ ] 27.6 Update Summary Stats to show teaching insights
    - Add new summary section showing:
      - Total tests scored
      - ✅ Automate: X tests (list names)
      - ⚠️ Maybe/Smoke: X tests (organisational compromises)
      - ❌ Don't: X tests (unchanged code)
    - Add teaching message:
      ```
      💡 Only X need automation! The other Y test unchanged code - 
         you already have coverage. Focus effort on what actually changed.
      
      ⚠️ Z tests triggered "Real Talk" - organisational pressure on unchanged code.
         Remember: One smoke test for stakeholder confidence, not comprehensive coverage.
      ```
    - Show breakdown of code change types:
      - New: X tests
      - Modified: X tests
      - UI only: X tests
      - Unchanged: X tests
    - Track and display Real Talk occurrences
    - _Requirements: Session-level teaching and reflection_

  - [ ] 27.7 Add Gut Feel comparison with Real Talk
    - When Gut Feel says "automate" but Real Talk appears, show:
      ```
      🤔 YOUR GUT vs REALITY
      
      Your instinct: Definitely/Probably automate
      Technical reality: Don't automate (unchanged code)
      Organisational reality: One smoke test for stakeholder confidence
      
      This is a common pattern - we feel we should test everything in a 
      new journey, but risk-based testing says focus on what changed.
      ```
    - Display location:
      - Inline in test row when gut feel conflicts with recommendation
      - Also in session summary showing overall gut feel accuracy
    - Help calibrate intuition over time
    - Track how often gut feel aligns with technical vs organisational recommendation
    - _Requirements: Teaching calibration_

  - [ ] 27.8 Update ScoreCalculator with new distinctness logic
    - Remove manual distinctness input
    - Auto-calculate distinctness from codeChange field:
      - new → 5
      - modified → 4
      - ui-only → 2
      - unchanged → 0
    - Update calculateValueScore to use auto-set distinctness
    - Update all score explanations to reference code change
    - _Requirements: Simplify input, enforce teaching_

  - [ ] 27.9 Integrate state diagram with confirmation testing strategy
    - [ ] 27.9.1 Enhanced state diagram import and diff
      - When importing state diagram JSON:
        - Parse states, transitions, metadata, lastModified dates
        - If previous state diagram exists, calculate comprehensive diff
        - Store both current and previous diagrams for comparison
        - Update StateDiagramService with diff calculation logic
      - Diff detection logic:
        - NEW: States in current but not in previous diagram
        - MODIFIED: States where lastModified changed OR transitions changed OR actions changed
        - UNCHANGED: States with identical lastModified and structure
        - REMOVED: States in previous but not in current (flag for review)
      - _Requirements: Accurate change detection from state diagrams_

    - [ ] 27.9.2 Integration point detection
      - Analyse transitions to identify integration points:
        - Find transitions from CHANGED states to UNCHANGED states
        - Find transitions from UNCHANGED states to CHANGED states
        - Find transitions between CHANGED states
      - Calculate integration complexity:
        - Count incoming and outgoing transitions per state
        - Identify states that are integration hubs (many transitions)
        - Flag high-risk integration points (changed → unchanged with high traffic)
      - Auto-set "Affected Areas" based on:
        - Number of outgoing transitions (what this state affects)
        - Number of incoming transitions (what affects this state)
        - Whether state is an integration point
      - _Requirements: Identify where changed and unchanged code meet_

    - [ ] 27.9.3 Visual diff display with confirmation strategy
      - Create StateDiagramDiff component showing:
        ```
        State Diagram Changes - [Application Name] - [Sprint/Version]
        
        CHANGED (needs confirmation testing): X states
        ⚠️  state_name (modified YYYY-MM-DD)
            → Transitions to: state_a, state_b
            → Integration point: connects to N unchanged states
            → Auto-generated test: [test name]
        
        UNCHANGED (already confirmed): X states
        ✅ state_name (last modified YYYY-MM-DD)
            → No new confirmation testing needed
            → Existing coverage applies
        
        INTEGRATION POINTS TO CONFIRM: X points
        🔗 changed_state → unchanged_state
            Risk: Changed behaviour needs to confirm handoff works
            Recommendation: Test integration, not full unchanged flow
        
        REMOVED STATES: X states (needs review)
        ❌ old_state_name
            → Tests for this state may need deletion/archival
        
        CONFIRMATION TESTING STRATEGY:
        ✓ Confirm: X changed states + X integration points = X tests
        ✗ Don't re-test: X unchanged states = skip
        🔍 Exploratory: X unchanged states accessed via new route
        
        Estimated testing effort: [calculated based on complexity]
        ```
      - Show diff summary before importing
      - Allow user to review before auto-generating tests
      - Highlight integration points visually (different colour)
      - _Requirements: Clear visualisation of what needs confirmation_

    - [ ] 27.9.4 Auto-generate test cases from diff
      - For each CHANGED state:
        - Create test case with pre-filled fields:
          - Test Name: "[State description] - [Change type]"
          - Did Code Change?: Auto-set based on diff
            - NEW states → "Yes - New"
            - MODIFIED states → "Yes - Modified"
            - If only lastModified changed → check if transitions/actions changed:
              - Changed → "Yes - Modified"
              - Unchanged → "Yes - UI only"
          - Affected Areas: Auto-set from transition count
          - Notes: Auto-populate from state.changeNotes if present
      - For each INTEGRATION POINT:
        - Create test case:
          - Test Name: "[Changed state] → [Unchanged state] integration"
          - Did Code Change?: "Yes - Modified" (integration changed)
          - Notes: "Confirms [changed] works with [unchanged]. Test the handoff, not full unchanged flow."
          - Organisational Pressure: Default to 3 (integration tests often get stakeholder attention)
      - For each UNCHANGED state accessed via new route:
        - Create test case with:
          - Did Code Change?: "No - Unchanged"
          - Notes: "Accessed via new route but code unchanged. Consider exploratory testing instead of automation."
          - Show "Real Talk" guidance automatically
      - User can review and delete unwanted auto-generated tests before finalising
      - _Requirements: Intelligent test case generation from state changes_

    - [ ] 27.9.5 Show confirmation testing context in each row
      - For test cases generated from state diagram:
        - Add badge: "From State: [state_id]"
        - Add link to view state in diagram diff
        - Show related states (what this integrates with)
        - Show if this is an integration point test
        - Add "View State Diagram" button that:
          - Opens diff view modal
          - Highlights the state this test relates to
          - Shows transitions and integration points
      - _Requirements: Maintain context link between tests and state diagram_

    - [ ] 27.9.6 Integration point scoring adjustments
      - Enhance scoring for integration point tests:
        - Integration tests have higher value (they test the seam)
        - Auto-set distinctness:
          - Changed → Unchanged integration: 4 (high value, testing new handoff)
          - Changed → Changed integration: 5 (testing new interaction)
          - Unchanged → Unchanged: 0 (already tested)
        - Add integration complexity to Affected Areas calculation
        - Show in score breakdown:
          ```
          Risk: 25 (high frequency × high impact)
          Value: 20 (integration point - tests changed/unchanged seam)
          Effort: 15
          History: 3 (multiple connected states)
          Total: 63 - MAYBE/AUTOMATE
          
          💡 This is an integration point test.
             It confirms [changed state] works with [unchanged state].
             Higher value than testing unchanged code alone.
          ```
      - _Requirements: Recognise integration tests are more valuable_

    - [ ] 27.9.7 Confirmation testing summary from state diagram
      - Add summary section showing confirmation strategy:
        ```
        CONFIRMATION TESTING STRATEGY
        Based on: [state diagram name] - Sprint [X]
        
        States Changed: X
        Integration Points: X
        Unchanged States: X
        
        Recommended Tests:
        ✅ Automate: X tests (changed states + critical integrations)
        ⚠️  Maybe: X tests (integration points)
        ❌ Don't Automate: X tests (unchanged, no new risk)
        🔍 Exploratory: X areas (unchanged, accessed via new route)
        
        Efficiency Gain:
        If you tested everything: X tests
        Risk-based confirmation: X tests
        Time saved: X%
        ```
      - Show comparison: "You could have created X tests, risk-based approach suggests X"
      - _Requirements: Show the value of risk-based confirmation testing_

    - [ ] 27.9.8 Handle multiple state diagrams (different journeys)
      - Support importing multiple state diagrams:
        - "BB Journey", "TV Journey", "Mobile Journey"
        - Each with its own diff and change detection
        - Tag generated tests with journey name
        - Filter view: "Show tests for TV Journey only"
      - Calculate integration points BETWEEN journeys:
        - Where do journeys share states?
        - Do changes in one journey affect another?
      - _Requirements: Handle complex multi-journey systems_

    - [ ] 27.9.9 Export confirmation testing report
      - Generate markdown/PDF report from state diagram analysis:
        ```
        # Confirmation Testing Strategy
        ## Sprint 45 - TV Journey Addition
        
        ### Changes Detected
        - 2 new states (tv_selection, tv_packages)
        - 1 modified state (bb_modal - moved to modal)
        - 15 unchanged states
        
        ### Integration Points
        1. tv_selection → checkout (CHANGED → UNCHANGED)
           - Risk: New product type entering checkout
           - Recommendation: Confirm checkout accepts TV products
        
        2. bb_modal → checkout (CHANGED → UNCHANGED)
           - Risk: Modal interaction may affect checkout data
           - Recommendation: Confirm modal data flows correctly
        
        ### Testing Strategy
        ✅ Automate: 4 tests
        - TV selection flow
        - BB modal interaction
        - TV → Checkout integration
        - BB modal → Checkout integration
        
        🔍 Exploratory: 15 areas
        - Checkout validation (unchanged)
        - Customer details (unchanged)
        - Direct debit (unchanged)
        [etc.]
        
        ### Why This Approach
        Traditional: Test entire TV journey end-to-end (20+ tests)
        Confirmation: Test what changed + integrations (4 tests)
        
        Unchanged code is already confirmed by existing tests.
        New tests focus on confirming changes didn't break related areas.
        ```
      - Export as markdown for team review
      - Export as PDF for stakeholder communication
      - Include visual state diagram with changes highlighted
      - _Requirements: Communicate strategy to team and stakeholders_

  - [ ] 27.10 Add "Testing Strategy" guidance for each recommendation
    - For each recommendation tier, show WHAT TO DO:
    - ✅ AUTOMATE (67-100):
      ```
      Testing Strategy: Automated Regression + Exploratory
      • Create automated tests for changed behaviour
      • Also do exploratory testing to find edge cases
      • Focus automation on critical paths and integration points
      ```
    - ⚠️ MAYBE (34-66):
      ```
      Testing Strategy: Exploratory First, Automate If Valuable
      • Start with exploratory testing
      • Automate only if you find frequent issues
      • Consider one smoke test for confidence
      • Re-evaluate after first release
      ```
    - ❌ DON'T AUTOMATE (0-33):
      ```
      Testing Strategy: Exploratory Testing
      • Manual exploration of functionality
      • Focus on integration with changed areas
      • Time-box: 30-60 minutes
      • Look for unexpected interactions, not regressions
      ```
    - Make it clear: "Don't automate" means "test differently", not "don't test"
    - Especially important for unchanged code (distinctness = 0)
    - Add to both individual row display and summary stats
    - Emphasise: "You still test everything, just smarter"
    - Display testing strategy below recommendation badge in each row
    - Include in summary stats to show overall testing approach
    - _Requirements: Clarify that all code gets tested, just with different strategies_

  - [ ] 27.11 Add "Regression Suite Reality Check" and Coverage Duvet teaching
    - Add optional "Bug History" field to each test:
      - "Has this test caught a real bug?"
      - Options: Yes-production / Yes-regression / No-never / Unknown
      - Helps teams realise which tests provide value
    - Add "Regression Suite Calculator" section:
      - User enters current regression suite stats:
        - Total tests: [number]
        - Runtime: [minutes]
        - Tests that caught bugs last sprint: [number]
        - Tests that fail for env/stub issues: [number]
    - Tool shows comparison:
      ```
      YOUR CURRENT SUITE:
      • 260 tests
      • 120 minutes runtime
      • 4 parallel workers = 480 worker-minutes
      • Bug detection: 2 bugs / 260 tests = 0.7%
      • Noise: 15 env failures / 260 = 5.7% false positive rate
      
      RISK-BASED ALTERNATIVE (based on your scores):
      • 12 tests on changed code
      • 15 minutes runtime
      • 1 parallel worker = 15 worker-minutes
      • 32x faster feedback
      • Focused on actual changes = higher signal, lower noise
      
      💡 You still test checkout. Just not with 259 automated
         tests that have never found a checkout bug.
      ```
    - Add "Coverage Duvet" teaching section:
      ```
      ⚠️ THE COVERAGE DUVET PROBLEM
      
      260 tests feels safe. But ask:
      • Which tests would fail if we broke checkout?
      • Which tests have EVER caught a checkout bug?
      • Which tests just verify stubs work?
      
      Coverage is comfortable. Risk-based testing is effective.
      
      Your legal text test (30 seconds) > 259 E2E tests (2 hours)
      Because it tested what CHANGED, not what felt comprehensive.
      ```
    - Add real case study to teaching:
      ```
      📖 REAL CASE STUDY: The Legal Text Bug
      
      What happened:
      • Someone deleted required legal text
      • 259 E2E tests through checkout: All passed ✅
      • 1 focused test on legal requirement: Failed ❌
      
      Why did 259 tests miss it?
      They were testing "checkout works end-to-end"
      not "legal text displays correctly"
      
      The lesson:
      Comprehensive coverage ≠ Effective testing
      One targeted test > 259 unfocused tests
      ```
    - Add to summary stats:
      ```
      🎯 FOCUS COMPARISON
      
      If you automated all 20 proposed tests:
      • 2 hours runtime (same as current)
      • Testing unchanged code (low value)
      • Likely to find: stub issues, env flakes
      
      If you follow risk-based recommendations:
      • 15 minutes runtime (8x faster)
      • Testing changed code (high value)
      • Likely to find: actual bugs
      
      Plus exploratory testing on unchanged areas gives
      you BETTER coverage than automated regression.
      ```
    - _Requirements: Teach the difference between coverage theatre and effective testing_

  - [ ] 27.12 Teach what regression testing actually is (not a comfort duvet)
    - Keep "regression testing" terminology but teach the correct definition
    - Update recommendation text for unchanged code:
      ```
      Recommendation: DON'T RE-TEST UNCHANGED CODE ❌
      
      Regression testing = Confirm changes didn't break related functionality
      NOT: Re-run everything to feel safe
      
      ✅ DO: Confirm checkout works with TV products (integration)
      ❌ DON'T: Re-test all checkout validation logic (unchanged)
      
      Your existing checkout tests already confirm that logic works.
      Regression testing means: test what the changes could have broken.
      ```
    - Add "What is Regression Testing?" to HelpModal:
      ```
      💡 WHAT REGRESSION TESTING ACTUALLY IS
      
      Regression testing = Confirm your changes didn't break
      related functionality.
      
      NOT: Run all 260 tests regardless of what changed
      NOT: A duvet of coverage to make you feel safe
      BUT: Targeted tests based on what changed
      
      Changed TV journey? Test:
      ✓ TV selection works (new code)
      ✓ BB modal works (changed code)
      ✓ Basket totals correct (related code)
      ✓ Checkout accepts TV products (integration point)
      
      Don't re-test unchanged validation logic.
      That's not regression testing, that's testing 260 lots of nothing.
      ```
    - Add teaching section:
      ```
      ⚠️ REGRESSION TESTING ≠ COMFORT BLANKET
      
      Most teams think regression testing means:
      "Run all our tests so we feel confident nothing broke"
      
      Actual regression testing means:
      "Test what the changes could realistically have broken"
      
      Your 260-test suite isn't regression testing.
      It's a duvet of coverage that makes you feel happy
      while missing actual bugs (like the legal text).
      
      Real regression testing:
      • Targets changed code + integration points
      • Fast feedback (minutes, not hours)
      • High signal (finds real bugs)
      • Low noise (doesn't fail for stub issues)
      ```
    - Update Testing Strategy language to emphasise targeted regression:
      - "Automated Regression (Targeted)" not "Automated Regression (Everything)"
      - Clarify: Regression = test what changed + related areas
    - _Requirements: Teach correct definition of regression testing vs coverage theatre_

  - [ ] 27.13 Create example scenarios in HelpModal
    - Add "Real Talk Examples" tab to HelpModal
    - Show three scenarios:
      1. Unchanged functionality with high pressure (TV journey customer details)
      2. Actually changed code with high pressure (BB modal selection)
      3. Unchanged with low pressure (postcode validation)
    - Include full scoring breakdown and recommendations for each
    - Show what Real Talk section would display
    - Add examples of what counts as "unchanged" vs "modified"
    - Add organisational pressure explanation
    - Include testing strategy for each scenario
    - Include "Coverage Duvet" example for unchanged code
    - Show legal text bug case study
    - _Requirements: Concrete teaching examples_

  - [ ] 27.14 Update data migration for new fields
    - Migrate existing changeType to codeChange:
      - 'new-functionality' → 'new'
      - 'modified-functionality' → 'modified'
      - 'ui-change' → 'ui-only'
      - 'refactoring' → 'unchanged'
    - Add default organisationalPressure = 1 for existing tests
    - Add default bugHistory = 'unknown' for existing tests
    - Recalculate distinctness based on new codeChange values
    - Show migration notification to user
    - _Requirements: Backward compatibility_

  - [ ]* 27.15 Write tests for new teaching features
    - Test Real Talk section display conditions
    - Test distinctness auto-calculation from codeChange
    - Test organisational recommendation logic
    - Test testing strategy display for each tier
    - Test Regression Suite Calculator
    - Test Coverage Duvet teaching display
    - Test confirmation testing language
    - Test summary stats calculations
    - Test gut feel comparison display
    - Test state diagram auto-detection of code changes
    - Test data migration
    - _Requirements: Test coverage_

  - [ ] 27.16 Update all documentation
    - Update USER_GUIDE.md with:
      - "Did Code Change?" field explanation
      - Organisational Pressure concept
      - Real Talk section purpose
      - Testing Strategy guidance for each recommendation tier
      - Confirmation Testing vs Regression Testing explanation
      - Coverage Duvet problem
      - Legal text bug case study
      - Regression Suite Reality Check feature
      - Example scenarios
    - Update HelpModal with new fields and logic
    - Update design.md specification
    - Add FAQ about technical vs organisational recommendations
    - Add FAQ: "Does 'Don't Automate' mean don't test?" → "No, use exploratory confirmation"
    - Add FAQ: "What is confirmation testing?" → Targeted verification based on changes
    - Add FAQ: "Why did my 260 tests miss the bug?" → Coverage ≠ Effectiveness
    - Include Angie Jones' "don't test what didn't change" principle
    - _Requirements: User education and onboarding_


- [x] 28. ~~Restore Distinctness as Manual Field (Fix Auto-Calculation Mistake)~~ (OBSOLETE - Task 31 uses manual distinctness from the start)
  - [ ] 28.1 Add distinctness field back to TestCase model
    - Add `distinctness: number` (1-5) to TestCase interface
    - Keep `codeChange` field for teaching/guidance
    - Update TypeScript interfaces in types/models.ts
    - _Requirements: Restore Angie's original methodology - user judgment matters_
    - _Rationale: We incorrectly auto-calculated distinctness, removing user judgment. A UI-only change might still be highly distinct (new pattern). Users need to think about "does this provide new information?"_

  - [ ] 28.2 Update ScoreCalculator to use manual distinctness
    - Remove auto-calculation of distinctness from codeChange
    - Use testCase.distinctness directly in calculateValueScore
    - Keep induction to action calculation based on codeChange
    - Formula: distinctness (manual) × induction to action (from codeChange)
    - Update score explanation to show: "Distinctness (5) × Induction (4) = 20"
    - _Requirements: Use user's judgment, not auto-calculated value_

  - [ ] 28.3 Add Distinctness slider to TestCaseRow
    - Add slider input (1-5) for distinctness
    - Position after "Did Code Change?" field
    - Label: "Distinctness: Does this test provide NEW information?"
    - Show descriptive labels:
      - 1 = "No new info (already tested)"
      - 2 = "Minor new info"
      - 3 = "Some new info"
      - 4 = "Significant new info"
      - 5 = "Completely new info"
    - Add tooltip explaining distinctness concept
    - _Requirements: Let users set distinctness manually_

  - [ ] 28.4 Pre-fill distinctness with suggested value based on codeChange
    - When user selects "Did Code Change?", suggest distinctness:
      - "Yes - New" → suggests distinctness: 5
      - "Yes - Modified" → suggests distinctness: 4
      - "Yes - UI only" → suggests distinctness: 2
      - "No - Unchanged" → suggests distinctness: 0
    - Show hint: "💡 Suggested: 5 (because you selected 'New')"
    - User can override the suggestion if they disagree
    - Pre-fill on new test cases and when codeChange changes
    - _Requirements: Provide guidance while preserving user judgment_

  - [ ] 28.5 Add teaching content about distinctness
    - Add info icon next to Distinctness slider
    - Tooltip explains:
      ```
      Distinctness = Does this test provide NEW information?
      
      Ask yourself:
      • Is this testing a new pattern/approach?
      • Does this verify something we haven't tested before?
      • Would this test catch bugs the existing tests wouldn't?
      
      Examples:
      • TV modal selection: UI-only change, but NEW modal pattern → 4
      • Checkout validation: Unchanged code, already tested → 0-1
      • New TV journey: Completely new functionality → 5
      ```
    - Add to HelpModal "Scoring Guide" tab
    - Include examples where auto-calculation would be wrong
    - _Requirements: Teach users to think about distinctness_

  - [ ] 28.6 Update Real Talk section to reference distinctness
    - For unchanged code with low distinctness (0-1):
      ```
      💬 REAL TALK: Unchanged Code
      
      You marked this as "No - Unchanged" and distinctness: 0
      This means the code hasn't changed AND the test provides
      no new information.
      
      Your existing tests already confirm this works.
      Automating this again is testing 260 lots of nothing.
      
      ✅ DO: Exploratory confirmation testing
      ❌ DON'T: Automate unchanged code
      ```
    - For UI-only change with high distinctness:
      ```
      💬 REAL TALK: UI Change with New Pattern
      
      You marked this as "UI only" but distinctness: 4
      This suggests it's a new UI pattern worth testing.
      
      Example: Modal selection is "UI only" but introduces
      a new interaction pattern that needs verification.
      ```
    - _Requirements: Use distinctness in teaching moments_

  - [ ] 28.7 Update data migration for distinctness field
    - For existing test cases without distinctness:
      - Calculate suggested distinctness from codeChange
      - Set distinctness = suggested value
      - Show notification: "Distinctness values have been suggested based on 'Did Code Change?'. Please review and adjust if needed."
    - Allow users to bulk-review and adjust
    - _Requirements: Backward compatibility_

  - [ ] 28.8 Update state diagram auto-generation to suggest distinctness
    - When generating test cases from state diagram:
      - NEW states → suggest distinctness: 5
      - MODIFIED states → suggest distinctness: 4
      - UI_ONLY changes → suggest distinctness: 2
      - UNCHANGED states → suggest distinctness: 0
    - User can adjust after generation
    - Show in notes: "Suggested distinctness: 5 (new state)"
    - _Requirements: Provide smart defaults while allowing override_

  - [ ]* 28.9 Write tests for manual distinctness
    - Test distinctness field in TestCase model
    - Test ScoreCalculator uses manual distinctness
    - Test distinctness slider UI component
    - Test pre-fill logic when codeChange changes
    - Test data migration for existing test cases
    - Test state diagram generation suggests distinctness
    - _Requirements: Test coverage_

  - [ ] 28.10 Update documentation
    - Update USER_GUIDE.md:
      - Explain distinctness concept
      - Show examples of when to override suggestions
      - Explain why distinctness is manual (user judgment matters)
      - Include TV modal example (UI-only but high distinctness)
    - Update HelpModal with distinctness explanation
    - Update design.md specification
    - Add FAQ: "Why isn't distinctness automatic?" → User judgment is essential
    - Add FAQ: "When should I override the suggested distinctness?" → Examples
    - _Requirements: User education_

  - [ ] 28.11 Remove auto-calculation references from codebase
    - Remove getDistinctnessValue helper method
    - Remove auto-distinctness comments
    - Update all score explanations to show manual distinctness
    - Update tooltips to reference manual distinctness
    - Clean up any remaining auto-calculation logic
    - _Requirements: Code cleanup_



- [x] 29. ~~Consolidate All Guidance into Expanded Row Section~~ (OBSOLETE - Task 31 implements Real Talk section differently)
  - [ ] 29.1 Remove tooltip system from table headers and cells
    - Remove info icons (ℹ️) from column headers
    - Remove hover tooltips from score cells
    - Remove TooltipProvider component usage from table
    - Keep tooltips only in HelpModal for reference
    - _Requirements: Reduce cognitive load, consolidate guidance in one place_
    - _Rationale: Tooltips are hidden by default and require hunting. All guidance should be visible in the expanded row section where users are already looking._

  - [ ] 29.2 Create comprehensive expanded row guidance section
    - Expand the current "Gut Feel Comparison" section to include ALL guidance
    - New section structure beneath each row:
      ```
      [Expanded Row Content]
      
      📊 SCORE BREAKDOWN
      Risk: 25/25 = User Frequency (5) × Business Impact (5)
      Value: 20/25 = Distinctness (5) × Induction to Action (4)
      Effort: 15/25 = Easy to Automate (3) × Quick to Automate (5)
      History: 3/5 = Connected Components (3)
      Legal: 0/20 = Not a legal requirement
      Total: 63/100
      
      🎯 GUT FEEL vs RECOMMENDATION
      Your instinct: "Probably Automate"
      Calculated: "MAYBE" (63/100)
      ✓ Close match! Your instinct aligns with the data.
      
      💬 REAL TALK: [Context-specific guidance]
      [Shows relevant teaching based on scores/fields]
      
      📖 FIELD EXPLANATIONS
      [Collapsible sections for each field with full explanation]
      
      🧪 TESTING STRATEGY
      [What to actually do based on recommendation]
      ```
    - Make each section collapsible/expandable
    - Show most relevant sections by default
    - _Requirements: All guidance in one visible location_

  - [ ] 29.3 Move score breakdown into expanded section
    - Remove score explanation tooltips from score cells
    - Show full score breakdown in expanded section
    - Include formulas and actual values
    - Show color-coded scores matching the table cells
    - Add "Why this score?" explanation for each component
    - Example:
      ```
      📊 SCORE BREAKDOWN
      
      Risk Score: 25/25 (Very High)
      = User Frequency (5) × Business Impact (5)
      Why: High frequency + high impact = must test thoroughly
      
      Value Score: 20/25 (High)
      = Distinctness (5) × Induction to Action (4)
      Why: Completely new functionality provides maximum new information
      Code Change: Yes - New
      
      Effort Score: 15/25 (Moderate)
      = Easy to Automate (3) × Quick to Automate (5)
      Why: Moderately easy but quick to implement
      
      History Score: 3/5 (Moderate)
      = Connected Components (3)
      Why: Affects 3 other areas of the system
      
      Legal Score: 0/20
      Why: Not a legal requirement
      
      Total: 63/100 → MAYBE
      ```
    - _Requirements: Make scoring transparent and educational_

  - [ ] 29.4 Move Real Talk section into expanded area
    - Keep Real Talk section but enhance it
    - Show context-specific guidance based on:
      - Code change status (unchanged, new, modified, UI-only)
      - Organisational pressure level
      - Gut feel vs recommendation mismatch
      - Score thresholds
    - Examples:
      ```
      💬 REAL TALK: Unchanged Code with High Pressure
      
      You marked this as "No - Unchanged" but organisational
      pressure is 5 (must show coverage).
      
      The code hasn't changed. Your existing tests already
      confirm this works. But stakeholders want to see it tested.
      
      ✅ TECHNICAL RECOMMENDATION: Don't automate (0 distinctness)
      ⚠️  ORGANISATIONAL REALITY: Automate for stakeholder confidence
      
      💡 COMPROMISE: One smoke test (5 min) instead of full suite
      ```
    - Show different Real Talk based on scenario
    - Make it conversational and practical
    - _Requirements: Context-aware teaching_

  - [ ] 29.5 Add collapsible field explanations section
    - Add "📖 Field Explanations" section with collapsible items
    - Each field gets a detailed explanation:
      ```
      📖 FIELD EXPLANATIONS
      
      ▼ Did Code Change?
        This field captures whether the code actually changed.
        
        • Yes - New: Never existed before
        • Yes - Modified: Behavior/logic changed
        • Yes - UI only: Styling/layout changed
        • No - Unchanged: Works the same way
        
        💡 If unchanged, you probably don't need to test it again!
        Your existing tests already confirm it works.
      
      ▼ Distinctness
        Does this test provide NEW information?
        
        Ask yourself:
        • Is this testing a new pattern/approach?
        • Does this verify something we haven't tested before?
        • Would this test catch bugs existing tests wouldn't?
        
        Examples:
        • TV modal: UI-only but new pattern → 4
        • Checkout: Unchanged, already tested → 0-1
        • New TV journey: Completely new → 5
      
      ▼ Organisational Pressure
        How much pressure to show test coverage?
        
        1 = No pressure, team decides
        3 = Some stakeholder anxiety
        5 = Must show coverage
        
        💡 This doesn't change technical recommendation,
        but helps you navigate organisational reality.
      
      [etc. for all fields]
      ```
    - Collapsed by default, expand on click
    - Include examples and teaching for each field
    - _Requirements: Self-documenting interface_

  - [ ] 29.6 Add testing strategy section to expanded area
    - Show actionable testing strategy based on recommendation:
      ```
      🧪 TESTING STRATEGY
      
      Recommendation: MAYBE (63/100)
      
      What to do:
      ✓ Start with exploratory testing
      ✓ Automate if you find frequent issues
      ✓ Consider one smoke test for confidence
      ✓ Re-evaluate after first release
      
      Time investment:
      • Exploratory: 30-60 minutes
      • Automation (if needed): 2-4 hours
      
      Why this approach:
      Moderate score suggests uncertainty. Explore first to
      understand the risk, then decide on automation.
      ```
    - Different strategy for each recommendation tier
    - Include time estimates
    - Make it actionable and practical
    - _Requirements: Tell users what to actually do_

  - [ ] 29.7 Simplify table header to remove info icons
    - Remove all ℹ️ info icons from column headers
    - Keep column headers clean and simple
    - Column names should be self-explanatory:
      - "Did Code Change?" (clear question)
      - "Distinctness" (with subtitle: "New info?")
      - "Easy?" and "Quick?" (short and clear)
      - "User Freq" and "Impact" (abbreviated but clear)
      - "Org Pressure" (with subtitle: "Stakeholder anxiety")
    - All detailed explanations moved to expanded section
    - _Requirements: Cleaner, less cluttered interface_

  - [ ] 29.8 Update mobile/card view to show expanded guidance
    - In mobile card view, show expanded section below each card
    - Make it easy to expand/collapse on mobile
    - Ensure all guidance is accessible on small screens
    - Use accordion pattern for collapsible sections
    - _Requirements: Mobile-friendly guidance_

  - [ ] 29.9 Add "Show/Hide Guidance" toggle
    - Add toggle button: "Show Guidance" / "Hide Guidance"
    - Allows users to collapse all expanded sections at once
    - Useful for experienced users who don't need guidance
    - Save preference in localStorage
    - Default: Show guidance for new users
    - _Requirements: Progressive disclosure for experienced users_

  - [ ] 29.10 Keep HelpModal as comprehensive reference
    - HelpModal remains as detailed reference documentation
    - Include all field explanations
    - Include scoring methodology
    - Include examples and case studies
    - Include FAQ
    - Link from expanded section: "See full documentation →"
    - _Requirements: Comprehensive reference for deep dives_

  - [ ]* 29.11 Write tests for consolidated guidance
    - Test expanded section renders correctly
    - Test score breakdown display
    - Test Real Talk section shows correct content
    - Test field explanations expand/collapse
    - Test testing strategy display
    - Test show/hide guidance toggle
    - Test mobile view rendering
    - _Requirements: Test coverage_

  - [ ] 29.12 Update documentation
    - Update USER_GUIDE.md to explain expanded guidance section
    - Remove references to tooltips in table
    - Update screenshots to show new expanded section
    - Document show/hide guidance feature
    - _Requirements: Documentation accuracy_

  - [ ] 29.13 Remove TooltipProvider component (if no longer needed)
    - Audit codebase for remaining tooltip usage
    - Remove TooltipProvider if only used in HelpModal
    - Clean up tooltip-related code
    - Simplify component structure
    - _Requirements: Code cleanup_



- [x] 30. ~~Add "Normal Mode" - Exact Angie Jones Model~~ (OBSOLETE - Task 31 already implements both Normal and Teaching modes correctly)
  - [x] 30.1 Add Mode Toggle
    - Add toggle at top of app: "Mode: ○ Normal  ○ Teaching"
    - Default to Normal mode
    - Store preference in localStorage
    - Toggle controls visibility of all teaching elements (Real Talk, warnings, etc.)
    - _Requirements: Let users choose calculator vs teaching experience_

  - [x] 30.2 Update TestCase model for Angie's exact fields
    - Remove current simplified fields in Normal mode
    - Add Angie's exact fields:
      ```typescript
      interface TestCaseAngie {
        // Feature
        testName: string;
        gutFeel: 1 | 2 | 3 | 4 | 5;
        
        // Customer Risk (max 25)
        impact: number; // 1-5 slider
        probOfUse: number; // 1-5 slider
        customerRiskScore: number; // impact × probOfUse (calculated)
        
        // Value of Test (max 25)
        distinctness: number; // 1-5 slider (MANUAL, not auto-calculated)
        fixProbability: number; // 1-5 slider
        valueScore: number; // distinctness × fixProbability (calculated)
        
        // Cost Efficiency (max 25)
        easyToWrite: number; // 1-5 slider
        quickToWrite: number; // 1-5 slider
        costScore: number; // easyToWrite × quickToWrite (calculated)
        
        // History (max 5)
        similarity: number; // 1-5 slider
        breakFreq: number; // 1-5 slider
        historyScore: number; // MAX(similarity, breakFreq) (calculated, NOT multiply)
        
        // Final
        finalScore: number; // sum of all scores (0-80)
      }
      ```
    - Note: Teaching mode keeps existing fields (codeChange, orgPressure, etc.)
    - _Requirements: Exact match to Angie's spreadsheet_

  - [x] 30.3 Create Normal Mode UI layout
    - Update TestCaseRow component to show Angie's layout when mode = "Normal"
    - Column layout matching Angie's spreadsheet:
      ```
      | Test Name | Gut Feel | Impact | Prob of Use | Distinctness | Fix Prob | Easy | Quick | Similarity | Break Freq | Score | Rec |
      ```
    - Each scoring category shows:
      - Two sliders side by side
      - Calculated score below/beside (greyed out, read-only)
      - Example for Customer Risk:
        ```
        Customer Risk (max 25)
        Impact: [slider 1-5]  Prob of use: [slider 1-5]
        Score: 25
        ```
    - Final Score column shows total (0-80) and color-coded recommendation
    - _Requirements: Match Angie's spreadsheet visual structure_

  - [x] 30.4 Implement Angie's exact scoring calculations
    - Create AngieScoreCalculator service
    - Customer Risk = impact × probOfUse (max 25)
    - Value = distinctness × fixProbability (max 25)
    - Cost Efficiency = easyToWrite × quickToWrite (max 25)
    - History = MAX(similarity, breakFreq) (max 5, NOT multiply)
    - Final Score = customerRisk + value + costEfficiency + history (max 80)
    - _Requirements: Exact calculation matching Angie's model_

  - [x] 30.5 Update recommendation thresholds for 0-80 scale
    - Angie's scale is 0-80, not 0-100
    - Adjust thresholds proportionally:
      - 67-100 (on 100 scale) = 54-80 (on 80 scale) → AUTOMATE ✅
      - 34-66 (on 100 scale) = 27-53 (on 80 scale) → MAYBE ⚠️
      - 0-33 (on 100 scale) = 0-26 (on 80 scale) → DON'T AUTOMATE ❌
    - Or use Angie's actual thresholds if known from her talk
    - Display recommendation badge based on score
    - _Requirements: Recommendations aligned with 0-80 scoring_

  - [x] 30.6 Add field tooltips matching Angie's definitions
    - Impact: "Severity if this breaks for customers"
    - Prob of use: "How often customers use this feature"
    - Distinctness: "Does this test provide NEW information? (Not duplicate existing tests)"
    - Fix probability: "Would dev team prioritize fixing if this test fails?"
    - Easy to write: "Implementation complexity (1=hard, 5=easy)"
    - Quick to write: "Time to implement (1=slow, 5=fast)"
    - Similarity: "Have similar areas broken before?"
    - Break freq: "How often does this area break?"
    - _Requirements: Clear explanation of each field_

  - [x] 30.7 Hide all teaching elements in Normal mode
    - When mode = "Normal", hide:
      - "Did Code Change?" field
      - "Organizational Pressure" field
      - "Unchanged Code" warnings
      - "Real Talk" sections
      - "Coverage Duvet" teaching
      - "Testing Strategy" guidance
      - All philosophy/teaching text
    - Show only:
      - Angie's exact fields
      - Score calculations
      - Simple recommendation badge
    - _Requirements: Clean calculator interface, no philosophy_

  - [x] 30.8 Update Summary Stats for Normal mode
    - When mode = "Normal", show simple summary:
      ```
      Total tests: 20
      ✅ Automate: 4 tests (54-80 score)
      ⚠️ Maybe: 8 tests (27-53 score)
      ❌ Don't: 8 tests (0-26 score)
      
      Average score: 42
      ```
    - No teaching messages
    - No "Real Talk" count
    - No philosophy
    - Just the numbers
    - _Requirements: Simple stats, no teaching_

  - [x] 30.9 Teaching Mode keeps all existing functionality
    - When mode = "Teaching", show:
      - All fields from tasks 27.1-27.16
      - All teaching elements
      - Real Talk sections
      - Coverage Duvet
      - Testing strategy guidance
      - Full philosophy experience
    - Uses 0-100 scoring scale
    - Uses current field structure (codeChange, orgPressure, etc.)
    - _Requirements: Preserve all teaching functionality built in task 27_

  - [ ] 30.10 State diagram integration in both modes
    - Normal Mode with state diagram:
      - Auto-fills Angie's fields where possible:
        - Impact, Prob of use (from state metadata if present)
        - Distinctness (based on change detection)
        - Similarity, Break freq (from state history if present)
      - User adjusts as needed
      - No teaching messages, just auto-fill
    - Teaching Mode with state diagram:
      - Uses existing 27.9 functionality
      - Full integration points, confirmation testing strategy, etc.
    - _Requirements: State diagrams work in both modes_

  - [ ] 30.11 Export/Import handling for both modes
    - JSON export includes mode indicator:
      ```json
      {
        "mode": "normal" | "teaching",
        "tests": [...],
        ...
      }
      ```
    - Import detects mode and loads appropriate fields
    - Allow converting between modes (with data mapping):
      - Normal → Teaching: Map Angie fields to teaching fields
      - Teaching → Normal: Extract relevant Angie fields
    - Warn user if converting and data will be transformed
    - _Requirements: Preserve work when switching modes_

  - [ ] 30.12 Add "About This Tool" modal explaining modes
    - Add info button near mode toggle
    - Explain two modes:
      ```
      NORMAL MODE
      Based on Angie Jones' test prioritization model.
      Simple calculator: 7 fields → score → recommendation.
      For teams who understand risk-based testing.
      
      TEACHING MODE
      Adds educational guidance for teams learning risk-based testing.
      Includes "Real Talk" about organizational pressure, confirmation 
      testing strategy, and coverage vs. effectiveness.
      For teams transitioning from coverage-based to risk-based testing.
      ```
    - Link to Angie Jones' talk
    - Link to your blog/docs about the philosophy (if exists)
    - _Requirements: Users understand what they're choosing_

  - [ ] 30.13 Update data migration to support both modes
    - Existing data (from task 27) maps to Teaching mode
    - Add migration path to convert to Normal mode format:
      - businessImpact → impact
      - userFrequency → probOfUse
      - Keep distinctness (it's manual in both)
      - easyToAutomate → easyToWrite
      - quickToAutomate → quickToWrite
      - affectedAreas → similarity (approximate)
      - Drop: codeChange, orgPressure, legal (Teaching mode only)
    - Recalculate scores for new mode
    - _Requirements: Existing users can switch modes_

  - [ ]* 30.14 Update tests for dual-mode functionality
    - Test Normal mode:
      - Angie's exact calculations
      - History uses MAX not multiply
      - 0-80 scoring scale
      - Correct thresholds
      - Teaching elements hidden
    - Test Teaching mode:
      - Existing functionality preserved
      - 0-100 scoring scale
      - All teaching elements visible
    - Test mode switching
    - Test data migration between modes
    - _Requirements: Both modes work correctly_

  - [ ] 30.15 Update documentation for both modes
    - Update USER_GUIDE.md:
      - Explain both modes
      - When to use each mode
      - How to switch between modes
      - Angie Jones model explanation (Normal mode)
      - Teaching model explanation (Teaching mode)
    - Add FAQ:
      - "Which mode should I use?"
        → Normal if team gets it, Teaching if you need to convince people
      - "What's the difference?"
        → Normal = calculator, Teaching = calculator + philosophy
      - "Can I switch modes?"
        → Yes, with data migration
    - Credit both Angie Jones and Dot Graham
    - _Requirements: Clear documentation of both modes_

  - [ ] 30.16 Polish Normal mode for speed
    - Normal mode optimized for fast data entry:
      - Keyboard shortcuts for sliders
      - Tab order logical (left to right through fields)
      - Enter key advances to next test
      - Copy previous test values (common fields)
      - Bulk edit multiple tests
    - Goal: Score 20 tests in under 10 minutes
    - _Requirements: Fast workflow for experienced users_



- [x] 31. Simplify Teaching Mode to Match Normal Mode Layout
  - **NOTE: This task supersedes tasks 27-30 with a cleaner, simpler approach**
  - **Both Normal Mode (0-80 scale) and Teaching Mode (0-100 scale) now use Angie's exact 7-field model**
  - **Teaching Mode adds: Legal Requirement (+20), Organizational Pressure (triggers Real Talk), and Coverage Duvet teaching**
  - [x] 31.1 Update Teaching Mode to use Angie's 7-field model
    - Remove all old Teaching mode fields (codeChange, businessImpact, userFrequency, etc.)
    - Use exact same 7 fields as Normal mode:
      - Impact (1-5)
      - Prob of Use (1-5)
      - Distinctness (1-5)
      - Fix Probability (1-5)
      - Easy to Write (1-5)
      - Quick to Write (1-5)
      - Similarity (1-5)
      - Break Freq (1-5)
    - Use same 2x2 grid layout as Normal mode
    - Use same scoring formulas as Normal mode
    - _Requirements: Teaching mode uses Angie's proven model_

  - [x] 31.2 Add Legal Requirement checkbox to Teaching Mode
    - Add checkbox field: "Legal Requirement"
    - When checked: add +20 to total score
    - Position below the 2x2 grid
    - Label: "☑ Legal Requirement (+20 points)"
    - _Requirements: Legal compliance testing support_

  - [x] 31.3 Add Organizational Pressure slider to Teaching Mode
    - Add slider field: "Organizational Pressure" (1-5)
    - Position below Legal Requirement checkbox
    - Label: "Organizational Pressure: How much pressure to show test coverage?"
    - Descriptive labels:
      - 1 = "No pressure"
      - 2 = "Slight pressure"
      - 3 = "Moderate pressure"
      - 4 = "High pressure"
      - 5 = "Must show coverage"
    - Does NOT affect score calculation
    - Only used to trigger teaching elements
    - _Requirements: Capture organizational reality_

  - [x] 31.4 Update Teaching Mode scoring to 0-100 scale
    - Base score: 0-80 (same as Normal mode)
    - Legal bonus: +20 if checked
    - Total: 0-100
    - Thresholds for 0-100 scale:
      - 67-100 → AUTOMATE
      - 34-66 → MAYBE
      - 0-33 → DON'T AUTOMATE
    - _Requirements: Accommodate legal requirement bonus_

  - [x] 31.5 Create TeachingScoreCalculator service
    - Extend AngieScoreCalculator
    - Add calculateLegalScore method (returns 0 or 20)
    - Add calculateTotalWithLegal method
    - Use same formulas as Angie for base score (0-80)
    - Add legal bonus on top
    - _Requirements: Separate calculator for Teaching mode_

  - [x] 31.6 Add conditional Real Talk section to Teaching Mode
    - Show Real Talk when:
      - Technical score < 34 (base 0-80 score, before legal)
      - OR Organizational Pressure ≥ 3
    - Real Talk content based on scenario:
      - Low technical score + high org pressure
      - Low technical score + low org pressure
      - High technical score + high org pressure
    - Position below the test case row (expandable section)
    - _Requirements: Context-aware teaching_

  - [x] 31.7 Add Coverage Duvet teaching section
    - Show when Real Talk is triggered
    - Explain the difference between coverage and effectiveness
    - Include case study examples
    - Position in expandable section below Real Talk
    - _Requirements: Teach coverage vs effectiveness_

  - [x] 31.8 Update TestCaseRowTeaching component
    - Copy layout from TestCaseRowNormal
    - Use same 2x2 grid
    - Add Legal Requirement checkbox below grid
    - Add Organizational Pressure slider below checkbox
    - Add expandable Real Talk section at bottom
    - Show teaching elements conditionally
    - _Requirements: Teaching mode UI matches Normal mode + extras_

  - [x] 31.9 Remove old Teaching Mode components and logic
    - Delete old TestCaseRow component (if separate from Normal)
    - Remove old ScoreCalculator logic for Teaching mode
    - Remove codeChange, distinctness auto-calculation
    - Remove all old Teaching mode fields from types
    - Clean up unused code
    - _Requirements: Code cleanup_

  - [x] 31.10 Update data migration for simplified Teaching Mode
    - Migrate existing Teaching mode data to new format:
      - Map old fields to Angie's 7 fields (best effort)
      - Set legal = false by default
      - Set orgPressure = 1 by default
      - Recalculate scores
    - Show migration notification to user
    - _Requirements: Backward compatibility_

  - [ ]* 31.11 Write tests for simplified Teaching Mode
    - Test Legal Requirement adds +20
    - Test Organizational Pressure doesn't affect score
    - Test Real Talk triggers correctly
    - Test 0-100 scoring scale
    - Test thresholds (67, 34)
    - Test teaching elements show/hide
    - _Requirements: Test coverage_

  - [x] 31.12 Update documentation for simplified Teaching Mode
    - Update USER_GUIDE.md:
      - Teaching Mode = Normal Mode + Legal + Org Pressure
      - Explain when Real Talk appears
      - Explain Coverage Duvet teaching
    - Update HelpModal
    - Update design.md
    - _Requirements: Clear documentation_


- [x] 32. Mobile UX Overhaul - Maximize Content Space
  - [x] 32.1 Hide Mode Toggle completely (both mobile and desktop)
    - Remove ModeToggle component from Header
    - Mode should be set via settings or URL parameter instead
    - Frees up significant header space
    - _Requirements: Mobile UX optimization_

  - [x] 32.2 Make Search/Filter collapsible with toggle button
    - Add filter icon button in header (mobile only)
    - Clicking opens/closes filter panel
    - Filter panel slides down from header when open
    - Closed by default on mobile
    - Always visible on desktop
    - _Requirements: Mobile UX optimization_

  - [x] 32.3 Move Summary Stats to collapsible drawer
    - Add stats icon button in header or floating button
    - Stats appear in bottom drawer that slides up
    - Closed by default on mobile
    - Always visible at bottom on desktop
    - Show quick summary (just counts) when collapsed
    - _Requirements: Mobile UX optimization_

  - [x] 32.4 Make Existing Functionality sidebar a proper toggle
    - Currently has chevron but takes up space when closed
    - Should completely hide when closed (0 width)
    - Add toggle button in header or as floating button
    - Better alignment when open
    - _Requirements: Mobile UX optimization_

  - [x] 32.5 Optimize header button layout for mobile
    - Stack buttons more efficiently
    - Consider hamburger menu for secondary actions
    - Keep only essential buttons visible (Add Row, Help)
    - Upload/Download in menu
    - _Requirements: Mobile UX optimization_

  - [x] 32.6 Test mobile layout on various screen sizes
    - Test on iPhone SE (smallest)
    - Test on standard iPhone/Android
    - Test on tablet
    - Ensure test case cards are prominent
    - Verify all functionality accessible
    - _Requirements: Mobile UX optimization_


- [x] 33. Standardize Mobile Input Fields to Match Desktop
  - [x] 33.1 Convert all mobile number inputs to sliders
    - Replace number input fields with range sliders in mobile card view
    - Ensure sliders match desktop styling and behavior
    - Apply to all scoring fields: Impact, Probability of Use, Distinctness, Fix Probability, Easy to Write, Quick to Write, Similarity, Break Frequency
    - _Requirements: Consistent UX across devices_

  - [x] 33.2 Standardize field labels and wording across mobile and desktop
    - Audit all field labels in both TestCaseRowNormal and TestCaseRowTeaching
    - Ensure mobile card labels exactly match desktop table headers
    - Update any abbreviated or different wording to be consistent
    - Verify tooltips and help text are identical
    - _Requirements: Consistent terminology_

  - [x] 33.3 Test mobile slider interactions
    - Verify sliders are touch-friendly (adequate size)
    - Test on various mobile devices
    - Ensure value updates are immediate
    - Check that sliders work smoothly on touch screens
    - _Requirements: Mobile usability_
