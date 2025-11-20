/**
 * BERTIntegrationService Usage Examples
 * 
 * This file demonstrates how to use the BERT integration features
 */

import { BERTIntegrationService } from './BERTIntegrationService';

// ============================================================================
// Example 1: Parsing BERT JSON from clipboard
// ============================================================================

async function examplePasteFromBERT() {
    try {
        // Read BERT JSON from clipboard
        const clipboardText = await BERTIntegrationService.readFromClipboard();

        // Parse the BERT JSON
        const parseResult = BERTIntegrationService.parseBERTJSON(clipboardText);

        if (!parseResult.success) {
            console.error('Failed to parse BERT JSON:', parseResult.error);
            return;
        }

        console.log('Parsed BERT scenario:', parseResult.data);

        // Map to test case
        const testCase = BERTIntegrationService.mapBERTFieldsToTestCase(parseResult.data!);
        console.log('Generated test case:', testCase);

    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================================================
// Example 2: Valid BERT JSON formats
// ============================================================================

// Format 1: Full BERT JSON with all fields
const fullBERTJSON = {
    bertScenarioId: 'BERT-123',
    scenarioTitle: 'User Login with Valid Credentials',
    jiraTicket: 'JIRA-456',
    detectedChangeType: 'new',
    detectedImplementation: 'custom-implementation',
    context: 'Testing the user authentication flow with valid username and password'
};

// Format 2: BERT JSON with alternative field names
const alternativeBERTJSON = {
    scenarioId: 'BERT-789',
    title: 'Payment Processing Flow',
    ticket: 'JIRA-101',
    changeType: 'modified-behavior',
    implementation: 'standard-components'
};

// Format 3: Minimal BERT JSON (only required fields)
const minimalBERTJSON = {
    id: 'BERT-999',
    name: 'Simple Test Case'
};

// ============================================================================
// Example 3: Parsing different BERT JSON formats
// ============================================================================

function exampleParsingFormats() {
    // Parse full format
    const result1 = BERTIntegrationService.parseBERTJSON(JSON.stringify(fullBERTJSON));
    console.log('Full format:', result1);

    // Parse alternative format
    const result2 = BERTIntegrationService.parseBERTJSON(JSON.stringify(alternativeBERTJSON));
    console.log('Alternative format:', result2);

    // Parse minimal format
    const result3 = BERTIntegrationService.parseBERTJSON(JSON.stringify(minimalBERTJSON));
    console.log('Minimal format:', result3);
}

// ============================================================================
// Example 4: Mapping BERT data to test case
// ============================================================================

function exampleMappingToTestCase() {
    const bertScenario = {
        bertScenarioId: 'BERT-123',
        scenarioTitle: 'User Login Test',
        jiraTicket: 'JIRA-456',
        detectedChangeType: 'new' as const,
        detectedImplementation: 'custom-implementation' as const,
        context: 'Testing user authentication flow'
    };

    const testCase = BERTIntegrationService.mapBERTFieldsToTestCase(bertScenario);

    console.log('Generated Test Case:');
    console.log('- ID:', testCase.id);
    console.log('- Name:', testCase.testName);
    console.log('- BERT Scenario ID:', testCase.bertScenarioId);
    console.log('- Jira Ticket:', testCase.jiraTicket);
    console.log('- Change Type:', testCase.changeType);
    console.log('- Implementation Type:', testCase.implementationType);
    console.log('- Total Score:', testCase.scores.total);
    console.log('- Recommendation:', testCase.recommendation);
    console.log('- Notes:', testCase.notes);
}

// ============================================================================
// Example 5: Copying decision to clipboard
// ============================================================================

async function exampleCopyDecision() {
    const testCase = {
        id: '123',
        testName: 'User Login Test',
        bertScenarioId: 'BERT-123',
        jiraTicket: 'JIRA-456',
        changeType: 'new' as const,
        implementationType: 'custom-implementation' as const,
        isLegal: false,
        userFrequency: 4,
        businessImpact: 5,
        affectedAreas: 3,
        notes: 'Critical authentication flow',
        scores: {
            risk: 20,
            value: 25,
            ease: 5,
            history: 3,
            legal: 0,
            total: 53
        },
        recommendation: 'MAYBE' as const,
        source: 'bert' as const
    };

    try {
        await BERTIntegrationService.copyDecisionToClipboard(testCase);
        console.log('Decision copied to clipboard successfully!');
    } catch (error) {
        console.error('Failed to copy decision:', error);
    }
}

// ============================================================================
// Example 6: Formatted decision output
// ============================================================================

function exampleFormattedDecision() {
    const testCase = {
        id: '123',
        testName: 'User Login Test',
        bertScenarioId: 'BERT-123',
        jiraTicket: 'JIRA-456',
        changeType: 'new' as const,
        implementationType: 'custom-implementation' as const,
        isLegal: false,
        userFrequency: 4,
        businessImpact: 5,
        affectedAreas: 3,
        notes: 'Critical authentication flow',
        scores: {
            risk: 20,
            value: 25,
            ease: 5,
            history: 3,
            legal: 0,
            total: 53
        },
        recommendation: 'MAYBE' as const,
        source: 'bert' as const
    };

    const formatted = BERTIntegrationService.formatDecisionForCopy(testCase);
    console.log('Formatted Decision:');
    console.log(formatted);
}

// ============================================================================
// Example 7: Error handling
// ============================================================================

function exampleErrorHandling() {
    // Invalid JSON
    const invalidJSON = 'not valid json {';
    const result1 = BERTIntegrationService.parseBERTJSON(invalidJSON);
    console.log('Invalid JSON result:', result1);
    // Output: { success: false, error: 'Invalid JSON format: ...' }

    // Missing required fields
    const missingFields = JSON.stringify({ someField: 'value' });
    const result2 = BERTIntegrationService.parseBERTJSON(missingFields);
    console.log('Missing fields result:', result2);
    // Output: { success: false, error: 'Invalid BERT data: missing scenario identifier...' }
}

// ============================================================================
// Export examples for documentation
// ============================================================================

export const examples = {
    examplePasteFromBERT,
    exampleParsingFormats,
    exampleMappingToTestCase,
    exampleCopyDecision,
    exampleFormattedDecision,
    exampleErrorHandling
};
