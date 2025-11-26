# Desktop Layout Fixes

## Issues to Fix

- [x] 1. Widen test name column and textarea
  - Current: `w-48 max-w-[200px]` is too narrow
  - Change to: `w-64` (256px) for better readability
  - Update both TestCaseRowNormal and TestCaseRowTeaching

- [x] 2. Make Gut Feel card smaller
  - Remove excessive padding
  - Reduce font sizes to match other cards better
  - Make it more compact vertically

- [x] 3. Add border between Total Score and Recommendation
  - Add a vertical divider line between the two sections
  - Use `border-l` on the Recommendation div

- [x] 4. Move /100 inside the Total Score box
  - Currently /100 is below the score causing misalignment
  - Put it inline with the score: "68/100" in the same box
  - Remove the separate span below

- [x] 5. Replace checkboxes with toggle buttons in new column
  - Create new column between Test Name and Gut Feel
  - Replace checkbox inputs with toggle button components
  - Button states:
    - Scored/Unscored (green when scored)
    - In Scope/Descoped (gray when descoped)
  - Style as proper toggle buttons with clear visual states
  - Remove checkboxes from Actions column

## Files to Update

- `src/components/TestCaseRowNormal.tsx`
- `src/components/TestCaseRowTeaching.tsx`
