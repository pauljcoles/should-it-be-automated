/**
 * BERTIntegrationService - Handles integration with BERT AI agent
 * 
 * Responsibilities:
 * - Parse BERT JSON from clipboard
 * - Map BERT fields to TestCase structure
 * - Format test decisions for copying back to BERT
 * - Handle clipboard operations for BERT workflow
 */

import type { BERTScenario, TestCase, ChangeType, ImplementationType } from '../types/models';
import { ChangeType as ChangeTypeEnum, ImplementationType as ImplementationTypeEnum, Recommendation } from '../types/models';
import { ScoreCalculator } from './ScoreCalculator';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of BERT JSON parsing
 */
export interface BERTParseResult {
    /** Whether parsing was successful */
    success: boolean;

    /** Parsed BERT scenario data (if successful) */
    data?: BERTScenario;

    /** Error message (if failed) */
    error?: string;
}

// ============================================================================
// BERTIntegrationService Class
// ============================================================================

export class BERTIntegrationService {
    /**
     * Parse BERT JSON from clipboard or string
     * Validates structure and extracts relevant fields
     * 
     * @param jsonString - The JSON string to parse
     * @returns Parse result with validation
     */
    static parseBERTJSON(jsonString: string): BERTParseResult {
        try {
            // Parse JSON
            let data: any;
            try {
                data = JSON.parse(jsonString);
            } catch (parseError) {
                return {
                    success: false,
                    error: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Parse error'}`
                };
            }

            // Validate BERT JSON structure
            if (!data || typeof data !== 'object') {
                return {
                    success: false,
                    error: 'Invalid BERT data: expected an object'
                };
            }

            // Check for required BERT fields
            if (!data.bertScenarioId && !data.scenarioId && !data.id) {
                return {
                    success: false,
                    error: 'Invalid BERT data: missing scenario identifier (bertScenarioId, scenarioId, or id)'
                };
            }

            if (!data.scenarioTitle && !data.title && !data.name) {
                return {
                    success: false,
                    error: 'Invalid BERT data: missing scenario title (scenarioTitle, title, or name)'
                };
            }

            // Extract and normalize BERT scenario data
            const bertScenario: BERTScenario = {
                bertScenarioId: data.bertScenarioId || data.scenarioId || data.id,
                scenarioTitle: data.scenarioTitle || data.title || data.name,
                jiraTicket: data.jiraTicket || data.jira || data.ticket,
                detectedChangeType: this.normalizeChangeType(data.detectedChangeType || data.changeType),
                detectedImplementation: this.normalizeImplementationType(data.detectedImplementation || data.implementation),
                context: data.context || data.notes || data.description
            };

            return {
                success: true,
                data: bertScenario
            };

        } catch (error) {
            return {
                success: false,
                error: `Failed to parse BERT JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Map BERT scenario fields to a new TestCase
     * Creates a test case with pre-filled fields from BERT data
     * 
     * @param bertScenario - The parsed BERT scenario
     * @returns A new TestCase with BERT data mapped
     */
    static mapBERTFieldsToTestCase(bertScenario: BERTScenario): TestCase {
        // Set default values for risk factors (user must adjust these)
        const userFrequency = 3;
        const businessImpact = 3;
        const affectedAreas = 3;

        // Use detected values or defaults
        const changeType = bertScenario.detectedChangeType || ChangeTypeEnum.NEW;
        const implementationType = bertScenario.detectedImplementation || ImplementationTypeEnum.CUSTOM;
        const isLegal = false;

        // Map legacy implementation type to effort scores
        const implementationToEffort: Record<string, { easy: number; quick: number }> = {
            'standard-components': { easy: 5, quick: 5 },
            'new-pattern': { easy: 3, quick: 5 },
            'custom-implementation': { easy: 1, quick: 5 },
            'hybrid': { easy: 2, quick: 5 }
        };
        const effort = implementationToEffort[implementationType] || { easy: 3, quick: 3 };
        const easyToAutomate = effort.easy;
        const quickToAutomate = effort.quick;

        // Calculate scores
        const riskScore = ScoreCalculator.calculateRiskScore(userFrequency, businessImpact);
        const valueScore = ScoreCalculator.calculateValueScore(changeType, businessImpact);
        const effortScore = ScoreCalculator.calculateEffortScore(easyToAutomate, quickToAutomate);
        const historyScore = ScoreCalculator.calculateHistoryScore(affectedAreas);
        const legalScore = ScoreCalculator.calculateLegalScore(isLegal);

        const scores = {
            risk: riskScore,
            value: valueScore,
            effort: effortScore,
            history: historyScore,
            legal: legalScore,
            total: 0
        };

        scores.total = ScoreCalculator.calculateTotalScore(scores);

        const recommendation = ScoreCalculator.getRecommendation(scores.total);

        // Build notes from BERT context
        let notes = '';
        if (bertScenario.context) {
            notes = `BERT Context: ${bertScenario.context}`;
        }
        if (bertScenario.detectedChangeType) {
            notes += notes ? '\n' : '';
            notes += `Detected Change: ${bertScenario.detectedChangeType}`;
        }
        if (bertScenario.detectedImplementation) {
            notes += notes ? '\n' : '';
            notes += `Detected Implementation: ${bertScenario.detectedImplementation}`;
        }

        // Create test case
        const testCase: TestCase = {
            id: this.generateUUID(),
            testName: bertScenario.scenarioTitle,
            changeType,
            easyToAutomate,
            quickToAutomate,
            isLegal,
            userFrequency,
            businessImpact,
            affectedAreas,
            notes: notes || undefined,
            bertScenarioId: bertScenario.bertScenarioId,
            jiraTicket: bertScenario.jiraTicket,
            scores,
            recommendation,
            source: 'bert',
            implementationType // Keep for backward compatibility
        };

        return testCase;
    }

    /**
     * Format test case decision for copying back to BERT
     * Creates a human-readable text format with score and recommendation
     * 
     * @param testCase - The test case to format
     * @returns Formatted decision text
     */
    static formatDecisionForCopy(testCase: TestCase): string {
        const lines: string[] = [];

        // Header
        lines.push('='.repeat(60));
        lines.push('TEST AUTOMATION DECISION');
        lines.push('='.repeat(60));
        lines.push('');

        // Test Information
        lines.push(`Test: ${testCase.testName}`);
        if (testCase.bertScenarioId) {
            lines.push(`BERT Scenario ID: ${testCase.bertScenarioId}`);
        }
        if (testCase.jiraTicket) {
            lines.push(`Jira Ticket: ${testCase.jiraTicket}`);
        }
        lines.push('');

        // Score Summary
        lines.push('SCORE SUMMARY');
        lines.push('-'.repeat(60));
        lines.push(`Total Score: ${testCase.scores.total}/100`);
        lines.push(`Recommendation: ${testCase.recommendation}`);
        lines.push('');

        // Score Breakdown
        lines.push('SCORE BREAKDOWN');
        lines.push('-'.repeat(60));
        lines.push(`Risk Score:    ${testCase.scores.risk}/25  (Frequency: ${testCase.userFrequency}, Impact: ${testCase.businessImpact})`);
        lines.push(`Value Score:   ${testCase.scores.value}/25  (Change: ${testCase.changeType})`);
        const effortScore = testCase.scores.effort ?? testCase.scores.ease ?? 0;
        if (testCase.easyToAutomate !== undefined && testCase.quickToAutomate !== undefined) {
            lines.push(`Effort Score:  ${effortScore}/25  (Easy: ${testCase.easyToAutomate}, Quick: ${testCase.quickToAutomate})`);
        } else if (testCase.implementationType) {
            lines.push(`Effort Score:  ${effortScore}/25  (Implementation: ${testCase.implementationType})`);
        } else {
            lines.push(`Effort Score:  ${effortScore}/25`);
        }
        lines.push(`History Score: ${testCase.scores.history}/5   (Affected Areas: ${testCase.affectedAreas})`);
        lines.push(`Legal Score:   ${testCase.scores.legal}/20  (Legal Requirement: ${testCase.isLegal ? 'Yes' : 'No'})`);
        lines.push('');

        // Rationale
        lines.push('RATIONALE');
        lines.push('-'.repeat(60));

        if (testCase.recommendation === Recommendation.AUTOMATE) {
            lines.push('✅ AUTOMATE THIS TEST');
            lines.push('This test scores highly across risk, value, and ease factors.');
            lines.push('Automation will provide significant ROI and reduce manual testing burden.');
        } else if (testCase.recommendation === Recommendation.MAYBE) {
            lines.push('⚠️  CONSIDER AUTOMATION');
            lines.push('This test has moderate priority. Consider automating if:');
            lines.push('- Team capacity allows');
            lines.push('- It fits into current sprint goals');
            lines.push('- Manual testing burden is high');
        } else {
            lines.push('❌ DO NOT AUTOMATE');
            lines.push('This test scores low on automation priority factors.');
            lines.push('Consider exploratory testing or manual verification instead.');
            lines.push('Automation may not provide sufficient ROI.');
        }

        // Additional context
        if (testCase.notes) {
            lines.push('');
            lines.push('ADDITIONAL NOTES');
            lines.push('-'.repeat(60));
            lines.push(testCase.notes);
        }

        lines.push('');
        lines.push('='.repeat(60));

        return lines.join('\n');
    }

    /**
     * Read BERT JSON from clipboard
     * 
     * @returns Promise resolving to clipboard content
     */
    static async readFromClipboard(): Promise<string> {
        try {
            const text = await navigator.clipboard.readText();
            return text;
        } catch (error) {
            throw new Error(`Failed to read from clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Copy formatted decision to clipboard
     * 
     * @param testCase - The test case to format and copy
     * @returns Promise resolving to true if successful
     */
    static async copyDecisionToClipboard(testCase: TestCase): Promise<boolean> {
        try {
            const formattedText = this.formatDecisionForCopy(testCase);
            await navigator.clipboard.writeText(formattedText);
            return true;
        } catch (error) {
            // Fallback for browsers without Clipboard API
            try {
                return this.fallbackCopyToClipboard(this.formatDecisionForCopy(testCase));
            } catch (fallbackError) {
                throw new Error(`Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    /**
     * Normalize change type from various BERT formats
     * 
     * @param value - The change type value from BERT
     * @returns Normalized ChangeType or undefined
     */
    private static normalizeChangeType(value: any): ChangeType | undefined {
        if (!value || typeof value !== 'string') {
            return undefined;
        }

        const normalized = value.toLowerCase().replace(/[_\s-]/g, '-');

        switch (normalized) {
            case 'new':
                return ChangeTypeEnum.NEW;
            case 'modified-behavior':
            case 'modifiedbehavior':
            case 'behavior':
                return ChangeTypeEnum.MODIFIED_BEHAVIOR;
            case 'modified-ui':
            case 'modifiedui':
            case 'ui':
                return ChangeTypeEnum.MODIFIED_UI;
            case 'unchanged':
            case 'no-change':
            case 'nochange':
                return ChangeTypeEnum.UNCHANGED;
            default:
                return undefined;
        }
    }

    /**
     * Normalize implementation type from various BERT formats
     * 
     * @param value - The implementation type value from BERT
     * @returns Normalized ImplementationType or undefined
     */
    private static normalizeImplementationType(value: any): ImplementationType | undefined {
        if (!value || typeof value !== 'string') {
            return undefined;
        }

        const normalized = value.toLowerCase().replace(/[_\s]/g, '-');

        switch (normalized) {
            // New names
            case 'standard-components':
            case 'standardcomponents':
            // Legacy names (for backward compatibility)
            case 'loop-same':
            case 'loopsame':
            case 'loop':
                return ImplementationTypeEnum.LOOP_SAME;
            // New names
            case 'new-pattern':
            case 'newpattern':
            // Legacy names
            case 'loop-different':
            case 'loopdifferent':
                return ImplementationTypeEnum.LOOP_DIFFERENT;
            // New names
            case 'custom-implementation':
            case 'customimplementation':
            // Legacy names
            case 'custom':
                return ImplementationTypeEnum.CUSTOM;
            // New names
            case 'hybrid':
            // Legacy names
            case 'mix':
            case 'mixed':
                return ImplementationTypeEnum.MIX;
            default:
                return undefined;
        }
    }

    /**
     * Fallback method for copying to clipboard (for older browsers)
     * Uses the deprecated execCommand method
     * 
     * @param text - Text to copy
     * @returns true if successful
     */
    private static fallbackCopyToClipboard(text: string): boolean {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (error) {
            document.body.removeChild(textArea);
            return false;
        }
    }

    /**
     * Generate a UUID v4
     * Simple implementation without external dependencies
     * 
     * @returns UUID string
     */
    private static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
