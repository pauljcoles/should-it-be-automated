# State Diagram Import Feature

## Overview

The Test Prioritisation Tool now supports importing state diagrams for model-based testing workflows. This feature automatically detects changes between diagram versions and generates test cases for new or modified states.

## How It Works

### 1. Upload a State Diagram

Click the **UPLOAD** button in the header or drag and drop a JSON file containing a state diagram.

### 2. View the Diff

If a previous version exists, the tool will:
- Compare the two versions
- Show a visual diff with color coding:
  - **Green**: Added states
  - **Yellow**: Modified states
  - **Red**: Removed states
  - **Gray**: Unchanged states

### 3. Review Changes

The diff modal displays:
- Summary counts of all changes
- Detailed list of what changed in each state
- Number of test cases that will be generated

### 4. Confirm Import

Click **IMPORT CHANGES** to:
- Generate test cases for new and modified states
- Populate the existing functionality list with all states
- Save the state diagram to version history (keeps last 3 versions)

## State Diagram Format

```json
{
  "version": "1.0",
  "applicationName": "Your App Name",
  "states": {
    "state_id": {
      "description": "Human-readable state name",
      "actions": ["action1", "action2"],
      "transitions": {
        "action1": "target_state_id"
      },
      "implementation": "loop-same|loop-different|custom|mix",
      "lastModified": "2024-01-15T10:00:00Z",
      "changeNotes": "Optional notes about changes"
    }
  },
  "metadata": {
    "team": "Team Name",
    "environment": "production",
    "generated": "2024-01-15T10:00:00Z"
  }
}
```

## Example

See `example-state-diagram.json` for a complete example of an e-commerce checkout flow.

## Test Case Generation

For each new or modified state, the tool generates a test case with:

- **Test Name**: State description or ID
- **Change Type**: 
  - `new` for added states
  - `modified-behavior` for states with action/transition changes
  - `modified-ui` for states with only implementation changes
- **Implementation Type**: From the state's `implementation` field
- **Affected Areas**: Count of incoming + outgoing transitions (capped at 5)
- **Notes**: Change details or `changeNotes` from the state
- **Default Values**: User frequency (3), business impact (3), not legal

You can then adjust these values based on your specific context.

## Version History

The tool maintains the last 3 versions of each state diagram per application. This allows you to:
- Track changes over time
- Compare any two versions
- Understand how your application has evolved

## Benefits

1. **Automated Test Case Generation**: No need to manually create test cases for state changes
2. **Change Detection**: Automatically identifies what's new or modified
3. **Traceability**: Links test cases back to specific states
4. **Context Preservation**: Maintains existing functionality list from state diagrams
5. **Version Control**: Keeps history of state diagram changes

## Tips

- Upload state diagrams at the start of each sprint to identify new test automation needs
- Review the diff carefully before importing to ensure changes are expected
- Adjust the generated test case priorities based on your team's context
- Use the existing functionality list to reference what's already implemented
