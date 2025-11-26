# Implementation Plan - UI Improvements

## Overview
Improvements to the test case table UI for better usability and workflow management.

- [x] 1. Default collapsed state on import
  - When importing test cases, all rows should start in collapsed state
  - Helps users see overview of all imported tests before diving into details
  - _Requirements: Better initial view for bulk imports_

- [x] 2. Add collapse/expand all toggle
  - Add a button in the header to collapse all rows
  - Add a button in the header to expand all rows
  - Should work for both Normal and Teaching modes
  - _Requirements: Bulk row management_

- [x] 3. Add "Scored" checkbox indicator
  - Add a visual indicator (checkbox or badge) to show which rows have been fully scored
  - A row is "scored" when all required fields have been filled in (not using default values)
  - Should be visible in both collapsed and expanded views
  - _Requirements: Track scoring progress_

- [x] 4. Add "Descope" checkbox
  - Add a checkbox labeled "Junk - Descope this test"
  - When checked, visually distinguish the row (e.g., gray out, strikethrough)
  - Descoped tests should be filterable/hideable
  - Should not affect score calculations
  - _Requirements: Mark tests for removal without deleting_

- [x] 5. Fix score label text overflow on small screens
  - Score explanation labels (e.g., "Completely new", "Fix immediately") overflow on small screens
  - On small screens: truncate with ellipsis
  - On larger screens: allow wrapping like Impact and Probability labels
  - Constrain text to the right side of the card
  - _Requirements: Responsive text display_

- [x] 6. Change test case name to textarea
  - Replace single-line input with textarea for test case name
  - Allow multi-line test descriptions for better visibility
  - Auto-resize textarea based on content
  - Maintain consistent styling with current design
  - _Requirements: More visible test case descriptions_

- [x] 7. Make summary statistics scores smaller
  - Reduce the size of score displays in the summary stats at the bottom
  - Make them more compact and less visually dominant
  - _Requirements: More compact summary statistics_

- [x] 8. Highlight expanded/collapsed row on toggle
  - When expanding or collapsing a row, briefly highlight it
  - Helps user identify which row they just interacted with
  - _Requirements: Better visual feedback_

- [x] 9. Scroll expanded row to top of viewport
  - When expanding a row, automatically scroll it to the top of the viewport
  - Prevents expanded content from being cut off below the fold
  - _Requirements: Better UX for expanded rows_

- [x] 10. Collapsible search and filters
  - Put search and filters in collapsible sections
  - Start with both collapsed by default
  - Give test case rows maximum vertical space
  - _Requirements: Maximize space for test cases_

## Notes
- All changes should work in both Normal and Teaching modes
- Maintain existing functionality while adding new features
- Consider mobile responsiveness for all new UI elements
