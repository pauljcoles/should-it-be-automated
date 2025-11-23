# Requirements Document

## Introduction

The Test Prioritisation Scoring Tool is a React-based application that helps QA teams make objective test automation decisions using Angie Jones' risk-based scoring model. The tool integrates with BERT's existing workflow by accepting scenario data and providing prioritization scores with clear recommendations. The application operates entirely client-side with no backend requirements, using JSON for state management and local storage for persistence.

## Glossary

- **BERT**: An AI agent in Kiro CLI that understands BDD and generates focused test scenarios
- **Test Case**: A single row in the application representing a potential test to be automated
- **Risk Score**: A calculated value (0-25) based on user frequency and business impact
- **Value Score**: A calculated value (0-25) based on distinctness and induction to action
- **Ease Score**: A calculated value (0-25) based on implementation risk
- **History Score**: A calculated value (0-5) based on affected areas
- **Legal Score**: A binary value (0 or 20) indicating legal/compliance requirements
- **Total Score**: Sum of all individual scores (0-100) determining automation recommendation
- **Recommendation**: A color-coded suggestion (AUTOMATE/MAYBE/DON'T AUTOMATE) based on total score
- **Standard Components**: Reusable components from the design system that follow established patterns
- **Change Type**: Classification of how functionality has changed (new, modified-behavior, modified-ui, unchanged)
- **Implementation Type**: Classification of technical implementation approach (standard-components, new-pattern, custom-implementation, hybrid)
- **Application State**: The complete JSON structure containing all test cases, metadata, and existing functionality

## Requirements

### Requirement 1: Row Management

**User Story:** As a QA team member, I want to manage test cases as rows in an Excel-like interface, so that I can quickly add, edit, and organize potential automation candidates.

#### Acceptance Criteria

1. WHEN a user clicks the add row button THEN the Application SHALL create a new empty row at the bottom of the table and focus the test name field
2. WHEN a user clicks the delete icon on a row THEN the Application SHALL display a confirmation dialog and remove the row upon confirmation
3. WHEN a user clicks the duplicate icon on a row THEN the Application SHALL create a new row with identical field values and append " (Copy)" to the test name
4. WHEN a user edits any field in a row THEN the Application SHALL update the value immediately without requiring a save action
5. WHEN a user tabs or presses enter in an editable field THEN the Application SHALL move focus to the next editable field in the row

### Requirement 2: Score Calculation

**User Story:** As a QA team member, I want automatic score calculations based on risk factors, so that I receive objective recommendations for test automation decisions.

#### Acceptance Criteria

1. WHEN a user modifies user frequency or business impact THEN the Application SHALL recalculate the risk score as the product of these two values
2. WHEN a user selects a change type THEN the Application SHALL recalculate the value score using distinctness and induction to action formulas
3. WHEN a user selects an implementation type THEN the Application SHALL recalculate the ease score as implementation risk multiplied by 5
4. WHEN a user modifies affected areas THEN the Application SHALL set the history score to the minimum of affected areas and 5
5. WHEN a user toggles the legal requirement checkbox THEN the Application SHALL set the legal score to 20 if checked or 0 if unchecked
6. WHEN any individual score changes THEN the Application SHALL recalculate the total score as the sum of all individual scores
7. WHEN the total score is between 67 and 100 THEN the Application SHALL display the recommendation as "AUTOMATE" with green styling
8. WHEN the total score is between 34 and 66 THEN the Application SHALL display the recommendation as "MAYBE" with yellow styling
9. WHEN the total score is between 0 and 33 THEN the Application SHALL display the recommendation as "DON'T AUTOMATE" with red styling

### Requirement 3: JSON State Management

**User Story:** As a QA team member, I want to import and export test case data as JSON, so that I can share prioritization decisions with my team and maintain version history.

#### Acceptance Criteria

1. WHEN a user clicks the upload button and selects a JSON file THEN the Application SHALL detect the JSON format type (Test Prioritisation State or State Diagram) and validate against the appropriate schema
2. WHEN a user uploads valid Test Prioritisation State JSON THEN the Application SHALL parse the content and update the application state with the imported data
3. WHEN a user clicks the download button THEN the Application SHALL serialize the current state to JSON and trigger a file download with the naming pattern "test-prioritization-{projectName}-{date}.json"
4. WHEN a user clicks the copy to clipboard button THEN the Application SHALL format the current state as JSON and copy it to the system clipboard
5. WHEN the Application serializes state to JSON THEN the JSON SHALL include version, projectName, created timestamp, lastModified timestamp, existingFunctionality array, testCases array, and metadata object

### Requirement 3A: State Diagram Import and Change Detection

**User Story:** As a QA team member using model-based testing, I want to import state diagram JSON files and automatically detect changes, so that I can quickly identify which states need new or updated test automation.

#### Acceptance Criteria

1. WHEN a user uploads a State Diagram JSON file THEN the Application SHALL parse the states object and extract all state definitions with their actions, transitions, implementation types, and lastModified timestamps
2. WHEN a user uploads a State Diagram JSON and a previous version exists THEN the Application SHALL compare the two versions and identify added states, removed states, modified states, and unchanged states
3. WHEN the Application detects a new state in the uploaded diagram THEN the Application SHALL automatically generate a test case with changeType set to "new"
4. WHEN the Application detects a modified state THEN the Application SHALL automatically generate a test case with changeType set to "modified-behavior" and populate notes with change details
5. WHEN the Application detects modified transitions in a state THEN the Application SHALL calculate affectedAreas as the count of incoming plus outgoing transitions
6. WHEN the Application generates test cases from a state diagram THEN the Application SHALL pre-fill implementationType from the state's implementation field and populate notes from changeNotes or description fields
7. WHEN the Application completes state diagram comparison THEN the Application SHALL display a visual diff summary showing counts of new, modified, and unchanged states before importing
8. WHEN a user confirms state diagram import THEN the Application SHALL create test cases for new and modified states and populate the existing functionality list with all states from the diagram

### Requirement 4: Data Persistence

**User Story:** As a QA team member, I want my work to be automatically saved, so that I don't lose progress if I accidentally close the browser.

#### Acceptance Criteria

1. WHEN a user modifies any field in the application THEN the Application SHALL save the complete state to localStorage after a 500ms debounce period
2. WHEN a user opens the application THEN the Application SHALL load the most recent state from localStorage if it exists
3. WHEN the Application saves to localStorage THEN the Application SHALL use the key "test-prioritizer-state"
4. WHEN a user attempts to close the browser with unsaved exports THEN the Application SHALL display a warning dialog
5. WHEN a user clears all data THEN the Application SHALL display a confirmation dialog and remove all data from localStorage upon confirmation

### Requirement 5: Existing Functionality Context

**User Story:** As a QA team member, I want to track already-implemented functionality, so that I can reference it when evaluating whether new test cases involve new or modified behavior.

#### Acceptance Criteria

1. WHEN a user views the application THEN the Application SHALL display a collapsible sidebar containing the existing functionality list
2. WHEN a user clicks add in the existing functionality section THEN the Application SHALL create a new entry with fields for name, implementation type, last tested date, and status
3. WHEN a user edits an existing functionality entry THEN the Application SHALL update the entry in the application state
4. WHEN a user deletes an existing functionality entry THEN the Application SHALL remove it from the list after confirmation
5. WHEN a user types in the existing functionality search box THEN the Application SHALL filter the list to show only matching entries
6. WHEN a state diagram is imported THEN the Application SHALL automatically populate the existing functionality list with all states from the diagram including their names, implementation types, and lastModified timestamps
7. WHEN the Application displays existing functionality entries THEN the Application SHALL show a badge indicating whether the entry was manually added or imported from a state diagram

### Requirement 6: Table Sorting and Filtering

**User Story:** As a QA team member, I want to sort and filter test cases, so that I can focus on specific subsets of tests and identify patterns.

#### Acceptance Criteria

1. WHEN a user clicks a column header THEN the Application SHALL sort all rows by that column in ascending order
2. WHEN a user clicks the same column header again THEN the Application SHALL reverse the sort order to descending
3. WHEN a user selects a recommendation filter THEN the Application SHALL display only rows matching that recommendation
4. WHEN a user types in the search box THEN the Application SHALL filter rows to show only those with matching test names or notes
5. WHEN a user applies multiple filters THEN the Application SHALL display only rows matching all active filter criteria

### Requirement 7: Visual Feedback and Color Coding

**User Story:** As a QA team member, I want clear visual indicators for scores and recommendations, so that I can quickly identify high-priority automation candidates.

#### Acceptance Criteria

1. WHEN the Application displays a recommendation of "AUTOMATE" THEN the Application SHALL apply a green background and green border to the recommendation cell
2. WHEN the Application displays a recommendation of "MAYBE" THEN the Application SHALL apply a yellow background and yellow border to the recommendation cell
3. WHEN the Application displays a recommendation of "DON'T AUTOMATE" THEN the Application SHALL apply a red background and red border to the recommendation cell
4. WHEN the Application displays individual score values THEN the Application SHALL apply color gradients based on score ranges (0-10 light gray, 11-20 light blue, 21-25 blue)
5. WHEN a user checks the legal requirement checkbox THEN the Application SHALL apply a bright yellow highlight to that row

### Requirement 8: Summary Statistics

**User Story:** As a QA team lead, I want to see aggregate statistics across all test cases, so that I can understand the overall automation landscape for sprint planning.

#### Acceptance Criteria

1. WHEN the Application displays test cases THEN the Application SHALL show the total count of all test cases at the bottom of the table
2. WHEN the Application displays test cases THEN the Application SHALL show counts of tests in each recommendation category (AUTOMATE, MAYBE, DON'T AUTOMATE)
3. WHEN the Application displays test cases THEN the Application SHALL calculate and display the average total score across all test cases
4. WHEN the Application displays test cases THEN the Application SHALL show the count of test cases marked as legal requirements
5. WHEN filters are applied THEN the Application SHALL update summary statistics to reflect only the filtered subset

### Requirement 9: Validation and Smart Suggestions

**User Story:** As a QA team member, I want validation warnings and smart suggestions, so that I can avoid common mistakes and make better automation decisions.

#### Acceptance Criteria

1. WHEN a user leaves the test name field empty THEN the Application SHALL display a validation error indicating this field is required
2. WHEN a user enters a test name longer than 100 characters THEN the Application SHALL display a warning with yellow highlighting
3. WHEN a user selects change type "unchanged" and user frequency greater than 3 THEN the Application SHALL display a warning suggesting exploratory testing instead
4. WHEN a user selects implementation type "standard-components" and the total score is less than 40 THEN the Application SHALL display a tip about considering maintenance cost versus value
5. WHEN a user checks the legal requirement checkbox and the total score is less than 50 THEN the Application SHALL display a note explaining this is regulatory testing
6. WHEN a user uploads a state diagram with a state containing no incoming transitions THEN the Application SHALL display a warning that the state may be unreachable
7. WHEN a user uploads a state diagram with a state containing no outgoing transitions THEN the Application SHALL display a warning that the state may be a dead end
8. WHEN a user uploads a state diagram with a transition to a non-existent state THEN the Application SHALL display a validation error identifying the invalid transition

### Requirement 10: Inline Help

**User Story:** As a new user of the tool, I want contextual help and explanations, so that I can understand how to use the scoring system without external documentation.

#### Acceptance Criteria

1. WHEN a user hovers over an info icon next to a field label THEN the Application SHALL display a tooltip explaining that field's purpose and options
2. WHEN a user hovers over a calculated score cell THEN the Application SHALL display a tooltip showing the formula used to calculate that score
3. WHEN a user hovers over a recommendation badge THEN the Application SHALL display a tooltip explaining why that score receives that recommendation
4. WHEN a user clicks the help button THEN the Application SHALL open a modal with tabs for Quick Start, Scoring Guide, Best Practices, and FAQ
5. WHEN the Application displays the help modal THEN the modal SHALL include examples of real test cases with their scoring rationale

### Requirement 11: BERT Integration via Clipboard

**User Story:** As a BERT user, I want to copy scenario data from BERT and paste it into the prioritization tool, so that I can seamlessly transition from scenario generation to automation decision-making.

#### Acceptance Criteria

1. WHEN a user clicks "Paste from BERT" and valid BERT JSON is in the clipboard THEN the Application SHALL parse the JSON and create a new row with pre-filled fields
2. WHEN the Application receives BERT JSON THEN the Application SHALL map bertScenarioId, scenarioTitle, jiraTicket, detectedChangeType, and detectedImplementation to corresponding fields
3. WHEN a user clicks "Copy Decision" on a row THEN the Application SHALL format the test name, score, recommendation, and rationale as text and copy to clipboard
4. WHEN the Application parses BERT JSON with a detectedChangeType THEN the Application SHALL populate the change type dropdown with that value
5. WHEN the Application parses BERT JSON with a detectedImplementation THEN the Application SHALL populate the implementation type dropdown with that value

### Requirement 12: Responsive Design

**User Story:** As a QA team member using various devices, I want the application to work on desktop and tablet screens, so that I can use it during meetings and on the go.

#### Acceptance Criteria

1. WHEN a user views the application on a desktop screen THEN the Application SHALL display the full table with all columns visible
2. WHEN a user views the application on a tablet screen THEN the Application SHALL enable horizontal scrolling for the table while keeping headers fixed
3. WHEN a user views the application on a tablet screen THEN the Application SHALL maintain all functionality including inline editing and button interactions
4. WHEN the viewport width is less than 1024 pixels THEN the Application SHALL collapse the existing functionality sidebar into a collapsible panel
5. WHEN a user interacts with touch gestures on a tablet THEN the Application SHALL respond to taps, swipes, and scrolling appropriately

### Requirement 13: Performance

**User Story:** As a QA team member working with large test suites, I want the application to remain responsive with many test cases, so that I can efficiently manage sprint-level automation decisions.

#### Acceptance Criteria

1. WHEN the Application contains 100 rows THEN the Application SHALL render and display all rows without visible lag
2. WHEN a user modifies a field THEN the Application SHALL recalculate all affected scores in less than 10 milliseconds
3. WHEN a user exports JSON with 100 rows THEN the Application SHALL complete the export in less than 100 milliseconds
4. WHEN a user edits a single cell THEN the Application SHALL update only the affected components without re-rendering the entire table
5. WHEN the Application saves to localStorage THEN the Application SHALL debounce save operations to prevent excessive write operations
6. WHEN a user uploads a state diagram with 50 states THEN the Application SHALL complete the diff comparison and display results in less than 500 milliseconds

### Requirement 14: Data Entry Fields

**User Story:** As a QA team member, I want comprehensive data entry fields for each test case, so that I can capture all relevant information for accurate scoring.

#### Acceptance Criteria

1. WHEN a user creates a new row THEN the Application SHALL provide text input fields for test name, notes, BERT scenario ID, and Jira ticket
2. WHEN a user interacts with the change type field THEN the Application SHALL display a dropdown with options: new, modified-behavior, modified-ui, unchanged
3. WHEN a user interacts with the implementation type field THEN the Application SHALL display a dropdown with options: standard-components, new-pattern, custom-implementation, hybrid
4. WHEN a user interacts with risk factor fields THEN the Application SHALL provide sliders or number inputs for user frequency (1-5), business impact (1-5), and affected areas (1-5)
5. WHEN a user interacts with the legal requirement field THEN the Application SHALL provide a checkbox that toggles between checked and unchecked states

### Requirement 15: State Diagram Version History

**User Story:** As a QA team member, I want to track multiple versions of state diagrams over time, so that I can compare changes across sprints and understand how the application has evolved.

#### Acceptance Criteria

1. WHEN a user uploads a state diagram THEN the Application SHALL store it in localStorage with a key pattern "test-prioritizer-states-{applicationName}-{timestamp}"
2. WHEN the Application stores state diagrams THEN the Application SHALL maintain the last 3 versions per application journey
3. WHEN a user views the state diagram history THEN the Application SHALL display a list of previously uploaded diagrams with their upload timestamps and application names
4. WHEN a user selects two state diagram versions from history THEN the Application SHALL display a visual comparison showing added, removed, and modified states between the selected versions
5. WHEN the Application reaches the storage limit of 3 versions THEN the Application SHALL automatically remove the oldest version when a new diagram is uploaded
