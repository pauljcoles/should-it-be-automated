/**
 * BERTIntegrationService Tests
 * Tests for BERT JSON parsing, field mapping, and decision formatting
 */

import { describe, it, expect } from 'vitest';
import { BERTIntegrationService } from './BERTIntegrationService';
import { CodeChange, ImplementationType, Recommendation } from '../types/models';

describe('BERTIntegrationService', () => {
    describe('parseBERTJSON', () => {
        it('should parse valid BERT JSON with all fields', () => {
            const bertJSON = JSON.stringify({
                bertScenarioId: 'BERT-123',
                scenarioTitle: 'User Login Test',
                jiraTicket: 'JIRA-456',
                detectedCodeChange: 'new',
                detectedImplementation: 'custom-implementation',
                context: 'Testing user authentication flow'
            });

            const result = BERTIntegrationService.parseBERTJSON(bertJSON);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.bertScenarioId).toBe('BERT-123');
            expect(result.data?.scenarioTitle).toBe('User Login Test');
            expect(result.data?.jiraTicket).toBe('JIRA-456');
            expect(result.data?.detectedCodeChange).toBe(CodeChange.NEW);
            expect(result.data?.detectedImplementation).toBe(ImplementationType.CUSTOM);
            expect(result.data?.context).toBe('Testing user authentication flow');
        });

        it('should parse BERT JSON with alternative field names', () => {
            const bertJSON = JSON.stringify({
                scenarioId: 'BERT-789',
                title: 'Payment Processing',
                ticket: 'JIRA-101',
                changeType: 'modified-behavior',
                organisationalPressure: 1,
                implementation: 'standard-components'
            });

            const result = BERTIntegrationService.parseBERTJSON(bertJSON);

            expect(result.success).toBe(true);
            expect(result.data?.bertScenarioId).toBe('BERT-789');
            expect(result.data?.scenarioTitle).toBe('Payment Processing');
            expect(result.data?.jiraTicket).toBe('JIRA-101');
            expect(result.data?.detectedCodeChange).toBe(CodeChange.MODIFIED);
            expect(result.data?.detectedImplementation).toBe(ImplementationType.LOOP_SAME);
        });

        it('should handle minimal BERT JSON with only required fields', () => {
            const bertJSON = JSON.stringify({
                id: 'BERT-999',
                name: 'Minimal Test'
            });

            const result = BERTIntegrationService.parseBERTJSON(bertJSON);

            expect(result.success).toBe(true);
            expect(result.data?.bertScenarioId).toBe('BERT-999');
            expect(result.data?.scenarioTitle).toBe('Minimal Test');
        });

        it('should fail on invalid JSON', () => {
            const invalidJSON = 'not valid json {';

            const result = BERTIntegrationService.parseBERTJSON(invalidJSON);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid JSON format');
        });

        it('should fail on missing scenario identifier', () => {
            const bertJSON = JSON.stringify({
                scenarioTitle: 'Test without ID'
            });

            const result = BERTIntegrationService.parseBERTJSON(bertJSON);

            expect(result.success).toBe(false);
            expect(result.error).toContain('missing scenario identifier');
        });

        it('should fail on missing scenario title', () => {
            const bertJSON = JSON.stringify({
                bertScenarioId: 'BERT-123'
            });

            const result = BERTIntegrationService.parseBERTJSON(bertJSON);

            expect(result.success).toBe(false);
            expect(result.error).toContain('missing scenario title');
        });
    });

    describe('mapBERTFieldsToTestCase', () => {
        it('should create test case with BERT data', () => {
            const bertScenario = {
                bertScenarioId: 'BERT-123',
                scenarioTitle: 'User Login Test',
                jiraTicket: 'JIRA-456',
                detectedCodeChange: CodeChange.NEW,
                detectedImplementation: ImplementationType.CUSTOM,
                context: 'Testing user authentication'
            };

            const testCase = BERTIntegrationService.mapBERTFieldsToTestCase(bertScenario);

            expect(testCase.id).toBeDefined();
            expect(testCase.testName).toBe('User Login Test');
            expect(testCase.bertScenarioId).toBe('BERT-123');
            expect(testCase.jiraTicket).toBe('JIRA-456');
            expect(testCase.codeChange).toBe(CodeChange.NEW);
            expect(testCase.implementationType).toBe(ImplementationType.CUSTOM);
            expect(testCase.source).toBe('bert');
            expect(testCase.notes).toContain('BERT Context');
            expect(testCase.notes).toContain('Testing user authentication');
        });

        it('should use default values when BERT data is minimal', () => {
            const bertScenario = {
                bertScenarioId: 'BERT-789',
                scenarioTitle: 'Minimal Test'
            };

            const testCase = BERTIntegrationService.mapBERTFieldsToTestCase(bertScenario);

            expect(testCase.testName).toBe('Minimal Test');
            expect(testCase.codeChange).toBe(CodeChange.NEW);
            expect(testCase.implementationType).toBe(ImplementationType.CUSTOM);
            expect(testCase.userFrequency).toBe(3);
            expect(testCase.businessImpact).toBe(3);
            expect(testCase.affectedAreas).toBe(3);
            expect(testCase.isLegal).toBe(false);
        });

        it('should calculate scores correctly', () => {
            const bertScenario = {
                bertScenarioId: 'BERT-123',
                scenarioTitle: 'Test',
                detectedCodeChange: CodeChange.NEW,
                detectedImplementation: ImplementationType.LOOP_SAME
            };

            const testCase = BERTIntegrationService.mapBERTFieldsToTestCase(bertScenario);

            expect(testCase.scores.risk).toBe(9); // 3 * 3
            expect(testCase.scores.value).toBe(15); // 5 * 3 (new with businessImpact 3)
            expect(testCase.scores.effort).toBe(25); // 5 * 5 (standard-components)
            expect(testCase.scores.history).toBe(3); // min(3, 5)
            expect(testCase.scores.legal).toBe(0); // not legal
            expect(testCase.scores.total).toBe(52); // sum of all
            expect(testCase.recommendation).toBe(Recommendation.MAYBE); // 34-66 range
        });
    });

    describe('formatDecisionForCopy', () => {
        it('should format decision with all information', () => {
            const testCase = {
                id: '123',
                testName: 'User Login Test',
                bertScenarioId: 'BERT-123',
                jiraTicket: 'JIRA-456',
                codeChange: CodeChange.NEW,
                organisationalPressure: 1,
                implementationType: ImplementationType.CUSTOM,
                isLegal: false,
                userFrequency: 4,
                businessImpact: 5,
                affectedAreas: 3,
                notes: 'Important test case',
                scores: {
                    risk: 20,
                    value: 25,
                    ease: 5,
                    history: 3,
                    legal: 0,
                    total: 53
                },
                recommendation: Recommendation.MAYBE,
                source: 'bert' as const
            };

            const formatted = BERTIntegrationService.formatDecisionForCopy(testCase);

            expect(formatted).toContain('TEST AUTOMATION DECISION');
            expect(formatted).toContain('User Login Test');
            expect(formatted).toContain('BERT-123');
            expect(formatted).toContain('JIRA-456');
            expect(formatted).toContain('53/100');
            expect(formatted).toContain('MAYBE');
            expect(formatted).toContain('Risk Score:    20/25');
            expect(formatted).toContain('Value Score:   25/25');
            expect(formatted).toContain('Effort Score:  5/25');
            expect(formatted).toContain('History Score: 3/5');
            expect(formatted).toContain('Legal Score:   0/20');
            expect(formatted).toContain('Important test case');
        });

        it('should include appropriate rationale for AUTOMATE recommendation', () => {
            const testCase = {
                id: '123',
                testName: 'High Priority Test',
                codeChange: CodeChange.NEW,
                organisationalPressure: 1,
                implementationType: ImplementationType.LOOP_SAME,
                isLegal: false,
                userFrequency: 5,
                businessImpact: 5,
                affectedAreas: 5,
                scores: {
                    risk: 25,
                    value: 25,
                    ease: 25,
                    history: 5,
                    legal: 0,
                    total: 80
                },
                recommendation: Recommendation.AUTOMATE,
                source: 'bert' as const
            };

            const formatted = BERTIntegrationService.formatDecisionForCopy(testCase);

            expect(formatted).toContain('✅ AUTOMATE THIS TEST');
            expect(formatted).toContain('significant ROI');
        });

        it('should include appropriate rationale for DON\'T AUTOMATE recommendation', () => {
            const testCase = {
                id: '123',
                testName: 'Low Priority Test',
                codeChange: CodeChange.UNCHANGED,
                organisationalPressure: 1,
                implementationType: ImplementationType.CUSTOM,
                isLegal: false,
                userFrequency: 1,
                businessImpact: 1,
                affectedAreas: 1,
                scores: {
                    risk: 1,
                    value: 0,
                    ease: 5,
                    history: 1,
                    legal: 0,
                    total: 7
                },
                recommendation: Recommendation.DONT_AUTOMATE,
                source: 'bert' as const
            };

            const formatted = BERTIntegrationService.formatDecisionForCopy(testCase);

            expect(formatted).toContain('❌ DO NOT AUTOMATE');
            expect(formatted).toContain('exploratory testing');
        });
    });
});
