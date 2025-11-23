# Test Prioritisation Tool - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Features](#core-features)
4. [Scoring System](#scoring-system)
5. [Workflows](#workflows)
6. [Tips and Best Practices](#tips-and-best-practices)
7. [Troubleshooting](#troubleshooting)

## Introduction

The Test Prioritisation Scoring Tool helps QA teams make objective decisions about test automation using Angie Jones' risk-based scoring methodology. The tool provides:

- **Objective Scoring**: Calculate automation priority based on multiple risk factors
- **Visual Recommendations**: Color-coded guidance (AUTOMATE/MAYBE/DON'T AUTOMATE)
- **State Diagram Integration**: Import model-based testing diagrams to auto-generate test cases
- **Scenario Tool Integration**: Import test scenarios from external tools via JSON
- **Data Portability**: Export/import as JSON for team collaboration

## Getting Started

### First Time Setup

1. **Open the Application**: Navigate to the deployed URL in your web browser
2. **Create Your First Project**: The tool automatically creates a project named "My Project"
3. **Rename Your Project**: Click on the project name in the header to edit it

### Understanding the Interface

The application consists of four main areas:

1. **Header**: Contains upload/download buttons, add row button, and help
2. **Existing Functionality Sidebar** (left): Track already-implemented features
3. **Test Case Table** (center): Main workspace for evaluating test cases
4. **Summary Statistics** (bottom): Aggregate metrics across all test cases

## Application Modes

The tool offers two modes to suit different team needs:

### Normal Mode (Default)

**Best for**: Experienced teams who want a fast, simple calculator

- Uses Angie Jones' exact 7-field scoring model
- 0-80 point scale (Customer Risk + Value + Cost + History)
- Clean 2x2 grid layout for quick data entry
- No teaching elements or guidance
- Fastest workflow for experienced users

**Fields**:
- **Customer Risk** (0-25): Impact × Probability of Use
- **Value of Test** (0-25): Distinctness × Fix Probability
- **Cost Efficiency** (0-25): Easy to Write × Quick to Write
- **History** (0-5): MAX(Similarity, Break Frequency)

**Recommendation Thresholds** (0-80 scale):
- 54-80 → AUTOMATE
- 27-53 → MAYBE
- 0-26 → DON'T AUTOMATE (Exploratory Testing)

### Teaching Mode

**Best for**: Learning teams who want educational guidance

- Uses same 7-field model as Normal Mode
- 0-100 point scale (0-80 base + 20 legal bonus)
- Includes Legal Requirement checkbox (+20 points)
- Includes Organizational Pressure slider (triggers teaching)
- Shows "Real Talk" section when appropriate
- Explains coverage vs. effectiveness

**Additional Fields**:
- **Legal Requirement**: Checkbox that adds +20 to total score
- **Organizational Pressure** (1-5): Captures pressure to show coverage
  - 1 = No pressure, team decides
  - 2 = Slight pressure
  - 3 = Moderate pressure (some stakeholder anxiety)
  - 4 = High pressure
  - 5 = Must show coverage

**Recommendation Thresholds** (0-100 scale):
- 67-100 → AUTOMATE
- 34-66 → MAYBE
- 0-33 → DON'T AUTOMATE (Exploratory Testing)

### Real Talk Section (Teaching Mode Only)

The Real Talk section appears when:
- Technical score < 34 (base 0-80 score, before legal bonus)
- OR Organizational Pressure ≥ 3

**What It Teaches**:

1. **Low Score + High Pressure**: Warns about "coverage theater" - automating tests just to show coverage numbers rather than catch bugs
2. **Low Score + Low Pressure**: Suggests focusing automation efforts on higher-value tests
3. **High Score + High Pressure**: Confirms that pressure is justified by technical value
4. **Legal Requirement**: Explains that compliance testing is mandatory regardless of technical score

### The Coverage Duvet

A key teaching concept in Teaching Mode:

> "High test coverage doesn't equal effective testing. It's like a duvet that looks warm but has holes - you might have 90% coverage but miss the critical 10% that matters."

**Focus on**: Tests that catch real bugs, not tests that make the coverage number go up.

### Switching Modes

1. Click the **Mode Toggle** button in the header
2. Choose **Normal** or **Teaching**
3. Your preference is saved automatically
4. Existing test cases work in both modes

## Core Features

### Managing Test Cases

#### Adding a New Test Case

1. Click the **"ADD ROW"** button in the header
2. A new empty row appears at the bottom of the table
3. The test name field is automatically focused

#### Editing Test Cases

- **Click any cell** to edit inline
- **Tab** or **Enter** to move to the next field
- Changes are saved automatically

#### Duplicating Test Cases

1. Click the **duplicate icon** (📋) on any row
2. A copy is created with " (Copy)" appended to the name
3. Modify the duplicate as needed

#### Deleting Test Cases

1. Click the **delete icon** (🗑️) on any row
2. Confirm the deletion in the dialog
3. The row is permanently removed

### Data Entry Fields

Each test case has the following fields:

| Field | Type | Description |
|-------|------|-------------|
| **Test Name** | Text | Descriptive name for the test (required) |
| **Change Type** | Dropdown | How functionality changed: new, modified-behavior, modified-ui, unchanged |
| **Implementation Type** | Dropdown | Technical approach: standard-components, new-pattern, custom-implementation, hybrid |
| **Usage Frequency** | Number (1-5) | How often users interact with this feature |
| **Impact if Broken** | Number (1-5) | Impact if this feature breaks |
| **Connected Components** | Number (1-5) | Number of related components connected to this feature |
| **Legal Requirement** | Checkbox | Whether this is legally/compliance required |
| **Notes** | Text | Additional context or rationale |
| **Scenario ID** | Text | Link to external scenario tool |
| **Jira Ticket** | Text | Associated Jira ticket number |
| **Initial Judgment (Gut Feel)** | Dropdown | Your instinctive decision before seeing scores (optional) |

### Initial Judgment (Gut Feel) Feature

The Initial Judgment feature helps you identify biases and learn from the scoring system by capturing your instinctive decision before seeing the calculated scores.

#### How It Works

1. **Before Scoring**: When creating a new test case, select your gut feel from the dropdown:
   - ✓✓ **Definitely Automate**: You're confident this should be automated
   - ✓ **Probably Automate**: You think automation makes sense
   - ? **Unsure**: You're not sure either way
   - ✗ **Probably Skip**: You think manual testing is better
   - ✗✗ **Definitely Skip**: You're confident this shouldn't be automated

2. **After Scoring**: Once you fill in the risk factors, the tool calculates the recommendation and compares it to your gut feel

3. **Mismatch Warning**: If your gut feel doesn't match the calculated recommendation, you'll see a ⚠️ warning icon with an explanation

#### Why Use This Feature?

**Learning Value**: Over time, you'll notice patterns in when your gut feel matches or differs from the calculated scores. This helps you:
- Understand which factors you naturally overweight or underweight
- Identify biases in your decision-making
- Learn to make better instinctive decisions
- Trust the scoring system more as you see it catch things you missed

**Common Mismatches**:

| Your Gut Feel | Calculated Rec | Why This Happens |
|---------------|----------------|------------------|
| Definitely Automate | Don't Automate | You may be overestimating usage frequency or underestimating implementation complexity |
| Definitely Skip | Automate | You may be missing the impact if broken or not considering how easy standard components are to test |
| Unsure | Automate/Don't Automate | You need more context about risk factors - the scoring helps clarify |

**Example: When Gut Feel Was Wrong**

*Scenario*: Testing a new admin dashboard feature
- **Your Gut Feel**: "Definitely Skip" - it's admin-only, low usage frequency
- **Calculated Recommendation**: "Automate" (Score: 72)
- **Why**: While usage frequency is low (2), impact if broken is critical (5), it uses standard components (ease: 25), and it's legally required (legal: 20)
- **Learning**: Legal requirements and ease of implementation can outweigh low frequency

#### Hiding the Column

Experienced users who no longer need this learning aid can hide the column:
1. Click the **"HIDE GUT FEEL"** button in the header (eye icon)
2. The column disappears from both desktop and mobile views
3. Click **"SHOW GUT FEEL"** to bring it back
4. Your preference is saved automatically

### Calculated Scores

The tool automatically calculates five scores:

1. **Risk Score** (0-25): Usage Frequency × Impact if Broken
2. **Value Score** (0-25): Based on change type and business impact
3. **Effort Score** (0-25): Easy to Automate × Quick to Automate
4. **History Score** (0-5): Based on connected components
5. **Legal Score** (0 or 20): Binary score for legal requirements

**Total Score** (0-100): Sum of all individual scores

### Recommendations

Based on the total score, the tool provides color-coded recommendations:

- 🟢 **AUTOMATE** (67-100): High priority for automation
- 🟡 **MAYBE** (34-66): Consider automation based on capacity
- 🔴 **DON'T AUTOMATE** (0-33): Low priority, consider manual testing

### Filtering and Sorting

#### Sorting

- Click any **column header** to sort ascending
- Click again to sort descending
- Current sort column is highlighted

#### Filtering

1. **By Recommendation**: Use the dropdown to show only specific recommendations
2. **By Search**: Type in the search box to filter by test name or notes
3. **Multiple Filters**: Combine filters to narrow results

### Existing Functionality Sidebar

Track already-implemented features to provide context for test case evaluation.

#### Adding Existing Functionality

1. Click **"+ Add"** in the sidebar
2. Enter the functionality name
3. Select implementation type
4. Optionally add last tested date

#### Managing Entries

- **Edit**: Click the edit icon to modify
- **Delete**: Click the delete icon to remove
- **Search**: Use the search box to filter entries

### Import/Export

#### Exporting Data

1. Click **"DOWNLOAD"** in the header
2. Choose **"Export JSON"** or **"Copy to Clipboard"**
3. File is saved as `test-prioritization-{projectName}-{date}.json`

#### Importing Data

1. Click **"UPLOAD"** in the header
2. Select a JSON file (Test Prioritisation State or State Diagram)
3. For State Diagrams: Review the diff modal and confirm import
4. For Test Prioritisation State: Data is loaded immediately

### State Diagram Integration

Import state diagrams from model-based testing tools to auto-generate test cases.

#### Importing a State Diagram

1. Click **"UPLOAD"** and select your state diagram JSON
2. Review the **Diff Summary** showing:
   - New states (green)
   - Modified states (yellow)
   - Removed states (red)
   - Unchanged states (gray)
3. Click **"Confirm Import"** to generate test cases
4. Existing functionality list is automatically populated

#### Generated Test Cases

For each new or modified state, the tool creates a test case with:
- Pre-filled change type
- Pre-filled implementation type
- Calculated affected areas
- Notes describing the changes

You still need to manually set:
- Usage frequency
- Impact if broken
- Legal requirement status

### Scenario Tool Integration

Import test scenarios from external tools (AI test generators, BDD tools, etc.).

#### Pasting Scenarios

1. Copy scenario JSON to clipboard from your external tool
2. Click **"Paste Scenario"** in the header
3. A new test case is created with pre-filled fields

**Expected JSON format:**
```json
{
  "scenarioId": "SCENARIO-123",
  "scenarioTitle": "User Login Test",
  "jiraTicket": "JIRA-456",
  "detectedChangeType": "new",
  "detectedImplementation": "standard-components",
  "context": "Test description..."
}
```

Alternative field names are supported: `id`, `bertScenarioId`, `title`, `name`, `ticket`, `implementation`, `changeType`

#### Copying Decisions

1. Complete your test case evaluation
2. Click **"Copy Decision"** on the row
3. Paste into your documentation or external tool

## Scoring System

### Understanding the Formulas

#### Risk Score (0-25)
```
Risk Score = Usage Frequency × Impact if Broken
```

**Example**: If users interact with a feature frequently (5) and it has high business impact (5):
```
Risk Score = 5 × 5 = 25
```

#### Value Score (0-25)

Based on two factors:
- **Distinctness**: How different is this from existing functionality?
- **Induction to Action**: How likely is this to cause issues?

| Change Type | Distinctness | Induction to Action |
|-------------|--------------|---------------------|
| Unchanged | 0 | 1 |
| Modified UI | 2 | 2 |
| Modified Behavior | 4 | 5 |
| New | 5 | Business Impact |

```
Value Score = Distinctness × Induction to Action
```

#### Effort Score (0-25)

Based on two independent factors:

```
Effort Score = Easy to Automate × Quick to Automate
```

**Easy to Automate (1-5)** - Technical complexity:
- **5**: Standard components, clear selectors, stable UI
- **4**: Mostly standard with minor customization
- **3**: Mix of standard and custom elements
- **2**: Complex custom implementation, dynamic content
- **1**: Highly complex, unstable, or inaccessible elements

**Quick to Automate (1-5)** - Time investment:
- **5**: Under 1 hour (simple form, button click)
- **4**: 1-2 hours of work
- **3**: Half day of work
- **2**: Full day or more
- **1**: Multiple days, requires research or new infrastructure

**Examples**:
- Standard login form: Easy = 5, Quick = 5 → Effort = 25 points
- Complex data table: Easy = 3, Quick = 2 → Effort = 6 points
- Custom canvas visualization: Easy = 1, Quick = 1 → Effort = 1 point

#### History Score (0-5)
```
History Score = min(Connected Components, 5)
```

#### Legal Score (0 or 20)
```
Legal Score = Legal Requirement ? 20 : 0
```

### Interpreting Scores

**High Priority for Automation** (67-100):
- High usage frequency and impact if broken
- New or significantly modified functionality
- Easy to implement (standard components)
- Affects multiple areas
- May have legal requirements

**Consider Automation** (34-66):
- Moderate risk and value
- Custom implementation may require more effort
- Balance automation cost vs. benefit

**Low Priority** (0-33):
- Low usage frequency or impact if broken
- Unchanged functionality
- Complex custom implementation
- Consider exploratory or manual testing

## Workflows

### Workflow 1: Manual Entry

For teams not using model-based testing or external scenario tools.

1. Click **"ADD ROW"** for each test case
2. Fill in all fields:
   - Test name (required)
   - Change type
   - Implementation type
   - Risk factors (frequency, impact, areas)
   - Legal requirement
3. Review calculated scores and recommendations
4. Add notes to document rationale
5. Export JSON for team review
6. Make automation decisions based on recommendations

### Workflow 2: State Diagram Import

For teams using model-based testing.

1. Export state diagram from your modeling tool
2. Click **"UPLOAD"** and select the state diagram JSON
3. Review the diff showing changes since last import
4. Click **"Confirm Import"**
5. Test cases are auto-generated for new/modified states
6. Adjust usage frequency and impact if broken for each
7. Review recommendations
8. Export decisions

### Workflow 3: Scenario Tool Integration

For teams using external scenario tools (AI generators, BDD tools, etc.).

1. Generate scenarios in your external tool
2. Copy scenario JSON to clipboard
3. Click **"Paste Scenario"** in the tool
4. Test case is created with pre-filled fields
5. Adjust risk factors as needed
6. Review recommendation
7. Click **"Copy Decision"** to export back to your tool

### Workflow 4: Sprint Planning

For QA leads planning automation work.

1. Import or create test cases for the sprint
2. Use filters to focus on specific recommendations
3. Review **Summary Statistics** at the bottom:
   - Total test cases
   - Count by recommendation
   - Average score
   - Legal requirement count
4. Sort by total score to prioritize
5. Assign automation work based on capacity
6. Export decisions for documentation

## Tips and Best Practices

### Scoring Guidelines

**Usage Frequency**:
- 5: Multiple times per day
- 4: Daily
- 3: Weekly
- 2: Monthly
- 1: Rarely

**Impact if Broken**:
- 5: Critical (revenue loss, data corruption, security breach)
- 4: High (major feature broken, poor user experience)
- 3: Medium (feature partially broken, workaround exists)
- 2: Low (minor inconvenience)
- 1: Minimal (cosmetic issue)

**Affected Areas**:
- Count the number of related components or states
- Include both direct and indirect dependencies
- Cap at 5 for scoring purposes

### When to Automate

**Always Automate**:
- Legal/compliance requirements (regardless of score)
- High-frequency, high-impact features
- Regression-prone areas
- Features with many connected components

**Consider Carefully**:
- Unchanged functionality with low frequency
- Complex custom implementations with low value
- UI-only changes with low impact if broken

**Avoid Automating**:
- One-time tests
- Exploratory testing scenarios
- Tests that change frequently
- Tests with high maintenance cost vs. value

### Maintaining the Tool

**Regular Updates**:
- Import updated state diagrams each sprint
- Review and archive old test cases
- Update existing functionality list
- Export data for version control

**Team Collaboration**:
- Share JSON exports via Git or shared drives
- Document scoring rationale in notes
- Review recommendations as a team
- Adjust scoring criteria based on team experience

## Troubleshooting

### Data Not Saving

**Issue**: Changes disappear after page refresh

**Solution**: 
- Check browser privacy settings
- Ensure localStorage is enabled
- Avoid private/incognito mode
- Export JSON regularly as backup

### Upload Not Working

**Issue**: JSON file won't upload

**Solution**:
- Verify file is valid JSON
- Check file format matches expected schema
- Try copying content and using "Paste Scenario"
- Check browser console for error messages

### Scores Not Calculating

**Issue**: Scores show as 0 or N/A

**Solution**:
- Ensure all required fields are filled
- Verify values are within valid ranges (1-5)
- Check for JavaScript errors in console
- Refresh the page

### Performance Issues

**Issue**: Application is slow with many test cases

**Solution**:
- Archive old test cases
- Use filters to reduce visible rows
- Clear browser cache
- Close other browser tabs

### State Diagram Import Fails

**Issue**: State diagram won't import or diff fails

**Solution**:
- Verify JSON structure matches expected format
- Check for circular references in transitions
- Ensure all transition targets exist as states
- Review validation errors in the modal

## Getting Help

- **In-App Help**: Click the **"?"** button in the header
- **Tooltips**: Hover over field labels and scores for explanations
- **Validation Warnings**: Pay attention to yellow/red indicators
- **Documentation**: Review this guide and the Developer Guide
- **Support**: Contact your team lead or open an issue

## Keyboard Shortcuts

- **Tab**: Move to next field
- **Enter**: Move to next field (in text inputs)
- **Ctrl/Cmd + N**: Add new row (when implemented)
- **Ctrl/Cmd + S**: Export JSON (when implemented)
- **Escape**: Close modals

---

**Version**: 1.0.0  
**Last Updated**: November 2025
