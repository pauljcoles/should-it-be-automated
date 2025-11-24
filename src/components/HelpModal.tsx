/**
 * HelpModal Component
 * 
 * Provides comprehensive help documentation with tabs for:
 * - Quick Start: Getting started guide
 * - Scoring Guide: Detailed scoring formulas and examples
 * - Best Practices: Tips for effective test Prioritisation
 * - FAQ: Common questions and answers
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, BookOpen, Calculator, Lightbulb, HelpCircle } from 'lucide-react';

type TabType = 'quick-start' | 'scoring-guide' | 'best-practices' | 'faq';

export function HelpModal() {
  const { uiState, setHelpModalOpen } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('quick-start');

  if (!uiState.isHelpModalOpen) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'quick-start', label: 'Quick Start', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'scoring-guide', label: 'Scoring Guide', icon: <Calculator className="w-4 h-4" /> },
    { id: 'best-practices', label: 'Best Practices', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col bg-white shadow-2xl">
        {/* Header */}
        <CardHeader className="border-b border-slate-300 bg-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800">Help & Documentation</CardTitle>
              <p className="text-xs text-slate-600 mt-1">
                Based on <a 
                  href="https://www.youtube.com/watch?v=VL-_pnICmGY" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Angie Jones' Risk-Based Testing Model
                </a>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Tab Navigation */}
        <div className="border-b border-slate-300 bg-slate-50 overflow-x-auto relative z-10 flex-shrink-0">
          <div className="flex h-[52px]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ width: '25%', minWidth: '140px' }}
                className={`px-4 py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all border-r border-slate-300 last:border-r-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white relative z-0">
          {activeTab === 'quick-start' && <QuickStartTab />}
          {activeTab === 'scoring-guide' && <ScoringGuideTab />}
          {activeTab === 'best-practices' && <BestPracticesTab />}
          {activeTab === 'faq' && <FAQTab />}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Quick Start Tab
// ============================================================================

function QuickStartTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Test Prioritisation Tool helps you make objective decisions about which tests to automate
          using Angie Jones' risk-based scoring methodology. Follow these steps to get started:
        </p>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-medium mb-2">
            📺 This tool implements the scoring model from Angie Jones' talk:
          </p>
          <a 
            href="https://www.youtube.com/watch?v=VL-_pnICmGY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-semibold text-sm"
          >
            "Which Tests Should We Automate?" - Angie Jones
          </a>
          <p className="text-xs text-blue-800 mt-2">
            Watch the talk to understand the methodology and reasoning behind the scoring system.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg bg-blue-50 p-6">
          <h3 className="font-semibold text-lg mb-2">1. Add Test Cases</h3>
          <p className="text-muted-foreground mb-3">
            Click the <span className="font-medium text-green-600">ADD ROW</span> button to create a new test case,
            or use <span className="font-medium text-blue-600">PASTE SCENARIO</span> to import from external scenario tools.
          </p>
          <p className="text-sm text-muted-foreground">
            You can also upload a state diagram JSON to automatically generate test cases for changed states.
          </p>
        </div>

        <div className="border rounded-lg bg-yellow-50 p-6">
          <h3 className="font-semibold text-lg mb-2">2. Fill in Test Details</h3>
          <p className="text-muted-foreground mb-3">
            For each test case, provide:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><span className="font-medium">Test Name:</span> A descriptive name for the test</li>
            <li><span className="font-medium">Change Type:</span> How the functionality changed (new, modified, unchanged)</li>
            <li><span className="font-medium">Effort Factors:</span> How easy and quick it is to automate (1-5 for each)</li>
            <li><span className="font-medium">Risk Factors:</span> Usage frequency, impact if broken, connected components</li>
            <li><span className="font-medium">Legal Requirement:</span> Check if this is a compliance/regulatory test</li>
          </ul>
        </div>

        <div className="border rounded-lg bg-green-50 p-6">
          <h3 className="font-semibold text-lg mb-2">3. Review Scores & Recommendations</h3>
          <p className="text-muted-foreground mb-3">
            Scores are calculated automatically based on your inputs:
          </p>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="border rounded-lg bg-green-100 p-3">
              <p className="font-semibold text-green-700 text-sm">AUTOMATE</p>
              <p className="text-xs text-green-800 mt-1">Score: 67-100</p>
            </div>
            <div className="border rounded-lg bg-yellow-100 p-3">
              <p className="font-semibold text-yellow-700 text-sm">MAYBE</p>
              <p className="text-xs text-yellow-800 mt-1">Score: 34-66</p>
            </div>
            <div className="border rounded-lg bg-red-100 p-3">
              <p className="font-semibold text-red-700 text-sm">Exploratory Testing</p>
              <p className="text-xs text-red-800 mt-1">Score: 0-33</p>
            </div>
          </div>
          <p className='text-muted-foreground mb-3'>A low score doesn't mean that you shouldn't test that thing, it just means that it may not be worth automating it.</p>
        </div>

        <div className="border rounded-lg bg-purple-50 p-6">
          <h3 className="font-semibold text-lg mb-2">4. Export & Share</h3>
          <p className="text-muted-foreground">
            Click <span className="font-medium text-purple-600">DOWNLOAD</span> to export your Prioritisation
            decisions as JSON. Share with your team or commit to version control.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Scoring Guide Tab
// ============================================================================

function ScoringGuideTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Scoring Formulas</h2>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900 font-medium mb-2">
            📊 This scoring model is from Angie Jones' risk-based testing methodology:
          </p>
          <a 
            href="https://www.youtube.com/watch?v=VL-_pnICmGY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-semibold text-sm"
          >
            "Which Tests Should We Automate?" - Angie Jones
          </a>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The total score is calculated from four main components (0-100 for Normal mode, 0-120 for Teaching mode with legal bonus). 
          Each component measures a different aspect of test automation value and feasibility.
        </p>
      </div>

      {/* RISK Score */}
      <div className="border rounded-lg bg-card p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <span className="bg-red-100 text-red-700 px-3 py-1 text-sm rounded">0-25 points</span>
          RISK
        </h3>
        <div className="bg-muted border rounded-lg p-4 mb-4 font-mono text-sm">
          RISK = Probability (1-5) × Impact (1-5)
        </div>
        <p className="text-muted-foreground mb-3">
          Measures how critical this functionality is based on usage frequency (probability) and business impact.
        </p>
        <div className="bg-blue-50 border rounded-lg p-4">
          <p className="font-medium text-sm mb-2">Example:</p>
          <p className="text-sm text-muted-foreground">
            Login functionality: Probability = 5 (used constantly), Impact = 5 (critical)
            <br />
            <span className="font-medium">RISK = 5 × 5 = 25 points</span>
          </p>
        </div>
      </div>

      {/* VALUE Score */}
      <div className="border rounded-lg bg-card p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 text-sm rounded">0-25 points</span>
          VALUE
        </h3>
        <div className="bg-muted border rounded-lg p-4 mb-4 font-mono text-sm">
          VALUE = Distinctness (1-5) × Induction to Action (1-5)
        </div>
        <p className="text-muted-foreground mb-3">
          Measures how much new information this test provides and how likely the team is to act on failures.
        </p>
        <div className="space-y-3">
          <div className="bg-blue-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Distinctness (1-5):</p>
            <p className="text-sm text-muted-foreground">
              Does this test provide NEW information not covered by other tests?
              <br />
              <span className="font-medium">5 = Completely unique, 1 = Redundant with existing tests</span>
            </p>
          </div>
          <div className="bg-green-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Induction to Action (1-5):</p>
            <p className="text-sm text-muted-foreground">
              Would the dev team prioritise fixing if this test fails?
              <br />
              <span className="font-medium">5 = Critical fix immediately, 1 = Low priority or ignored</span>
            </p>
          </div>
          <div className="bg-purple-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Example:</p>
            <p className="text-sm text-muted-foreground">
              Payment processing test: Distinctness = 5 (unique critical path), Induction = 5 (must fix immediately)
              <br />
              <span className="font-medium">VALUE = 5 × 5 = 25 points</span>
            </p>
          </div>
        </div>
      </div>

      {/* COST EFFICIENCY Score */}
      <div className="border rounded-lg bg-card p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <span className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded">0-25 points</span>
          COST EFFICIENCY
        </h3>
        <div className="bg-muted border rounded-lg p-4 mb-4 font-mono text-sm">
          COST EFFICIENCY = Easy to write (1-5) × Quick to write (1-5)
        </div>
        <p className="text-muted-foreground mb-3">
          Measures the effort required to automate based on two factors: technical complexity and time investment.
        </p>
        <div className="space-y-3">
          <div className="bg-green-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Easy to write (1-5):</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              <li><strong>5 - Very Easy:</strong> Standard components, clear selectors, stable UI</li>
              <li><strong>4 - Easy:</strong> Mostly standard with minor customization</li>
              <li><strong>3 - Moderate:</strong> Mix of standard and custom elements</li>
              <li><strong>2 - Difficult:</strong> Complex custom implementation, dynamic content</li>
              <li><strong>1 - Very Difficult:</strong> Highly complex, unstable, or inaccessible elements</li>
            </ul>
          </div>
          <div className="bg-blue-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Quick to write (1-5):</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              <li><strong>5 - Very Quick:</strong> Can automate in under 1 hour</li>
              <li><strong>4 - Quick:</strong> 1-2 hours of work</li>
              <li><strong>3 - Moderate:</strong> Half day of work</li>
              <li><strong>2 - Slow:</strong> Full day or more</li>
              <li><strong>1 - Very Slow:</strong> Multiple days, requires research or new infrastructure</li>
            </ul>
          </div>
          <div className="bg-purple-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Examples:</p>
            <p className="text-xs text-muted-foreground mb-1">
              <strong>Login form (standard):</strong> Easy = 5, Quick = 5 → Cost Efficiency = 25 points
            </p>
            <p className="text-xs text-muted-foreground mb-1">
              <strong>Complex data table with filters:</strong> Easy = 3, Quick = 2 → Cost Efficiency = 6 points
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Custom canvas visualization:</strong> Easy = 1, Quick = 1 → Cost Efficiency = 1 point
            </p>
          </div>
        </div>
      </div>

      {/* HISTORY Score */}
      <div className="border rounded-lg bg-card p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <span className="bg-purple-100 text-purple-700 px-3 py-1 text-sm rounded">0-25 points</span>
          HISTORY
        </h3>
        <div className="bg-muted border rounded-lg p-4 mb-4 font-mono text-sm">
          HISTORY = Bug count (1-5) × Affected areas (1-5)
        </div>
        <p className="text-muted-foreground mb-3">
          Measures the historical bug frequency and scope of impact for this area of the system.
        </p>
        <div className="space-y-3">
          <div className="bg-amber-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Bug count (1-5):</p>
            <p className="text-sm text-muted-foreground">
              How often do bugs occur in this area?
              <br />
              <span className="font-medium">5 = Frequent bugs, 1 = Rarely has bugs</span>
            </p>
          </div>
          <div className="bg-orange-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Affected areas (1-5):</p>
            <p className="text-sm text-muted-foreground">
              How many parts of the system are affected by this functionality?
              <br />
              <span className="font-medium">5 = Affects many areas, 1 = Isolated component</span>
            </p>
          </div>
          <div className="bg-purple-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">Example:</p>
            <p className="text-sm text-muted-foreground">
              Authentication system: Bug count = 2 (occasional bugs), Affected areas = 5 (used everywhere)
              <br />
              <span className="font-medium">HISTORY = 2 × 5 = 10 points</span>
            </p>
          </div>
          <div className="bg-blue-50 border rounded-lg p-4">
            <p className="font-medium text-sm mb-2">⚠️ Angie's Note:</p>
            <p className="text-sm text-muted-foreground italic">
              History typically scores low because most areas don't have frequent bugs. Don't worry if this score is low - 
              it's normal and expected. Focus on RISK, VALUE, and COST EFFICIENCY for prioritization.
            </p>
          </div>
        </div>
      </div>

      {/* Legal Score */}
      <div className="border rounded-lg bg-card p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 text-sm rounded">0 or 20 points</span>
          Legal Score
        </h3>
        <div className="bg-muted border rounded-lg p-4 mb-4 font-mono text-sm">
          Legal Score = isLegal ? 20 : 0
        </div>
        <p className="text-muted-foreground mb-3">
          Binary score for legal/compliance requirements that must be tested regardless of other factors.
        </p>
        <div className="bg-yellow-50 border rounded-lg p-4">
          <p className="font-medium text-sm mb-2">Examples of Legal Requirements:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>GDPR compliance (data deletion, consent)</li>
            <li>Accessibility requirements (WCAG)</li>
            <li>Financial regulations (audit trails)</li>
            <li>Healthcare compliance (HIPAA)</li>
          </ul>
        </div>
      </div>

      {/* Total Score */}
      <div className="border rounded-lg bg-gradient-to-r from-green-100 to-yellow-100 p-6">
        <h3 className="font-semibold text-xl mb-3">Total Score & Recommendation</h3>
        <div className="space-y-3 mb-4">
          <div className="bg-background border rounded-lg p-4 font-mono text-sm">
            <strong>Normal Mode:</strong> Total = RISK + VALUE + COST EFFICIENCY + HISTORY (0-100)
          </div>
          <div className="bg-background border rounded-lg p-4 font-mono text-sm">
            <strong>Teaching Mode:</strong> Total = RISK + VALUE + COST EFFICIENCY + HISTORY + Legal (0-120)
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-200 border rounded-lg p-4">
            <p className="font-semibold text-green-800 text-lg">67-100 (or 120)</p>
            <p className="text-sm font-medium text-green-900 mt-1">AUTOMATE</p>
            <p className="text-xs text-green-800 mt-2">High value, clear automation candidate</p>
          </div>
          <div className="bg-yellow-200 border rounded-lg p-4">
            <p className="font-semibold text-yellow-800 text-lg">34-66</p>
            <p className="text-sm font-medium text-yellow-900 mt-1">MAYBE</p>
            <p className="text-xs text-yellow-800 mt-2">Consider context and resources</p>
          </div>
          <div className="bg-red-200 border rounded-lg p-4">
            <p className="font-semibold text-red-800 text-lg">0-33</p>
            <p className="text-sm font-medium text-red-900 mt-1">Exploratory Testing</p>
            <p className="text-xs text-red-800 mt-2">Low value for automation, consider exploratory testing</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Best Practices Tab
// ============================================================================

function BestPracticesTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
        <p className="text-muted-foreground leading-relaxed">
          Follow these guidelines to make the most effective test automation decisions.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg bg-green-50 p-6">
          <h3 className="font-semibold text-lg mb-3 text-green-800">✓ DO: Focus on High-Risk Areas</h3>
          <p className="text-muted-foreground mb-3">
            Prioritise tests for functionality that is frequently used and has high business impact.
            These are the areas where bugs will hurt the most.
          </p>
          <div className="bg-background border rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Example:</p>
            <p className="text-muted-foreground">
              Login, checkout, payment processing → High frequency + High impact = Automate first
            </p>
          </div>
        </div>

        <div className="border rounded-lg bg-green-50 p-6">
          <h3 className="font-semibold text-lg mb-3 text-green-800">✓ DO: Automate New & Modified Behavior</h3>
          <p className="text-muted-foreground mb-3">
            New features and behavior changes are most likely to have bugs. These should score
            higher in your Prioritisation.
          </p>
          <div className="bg-background border rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Tip:</p>
            <p className="text-muted-foreground">
              Use state diagram imports to automatically identify changed states and generate test cases.
            </p>
          </div>
        </div>

        <div className="border rounded-lg bg-green-50 p-6">
          <h3 className="font-semibold text-lg mb-3 text-green-800">✓ DO: Prioritise Easy & Quick Tests</h3>
          <p className="text-muted-foreground mb-3">
            When functionality uses standard components and clear patterns, automation is both easier
            and quicker. Rate these highly on both effort factors (5 for easy, 5 for quick = 25 points).
          </p>
          <div className="bg-background border rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Example:</p>
            <p className="text-muted-foreground">
              Standard login form with clear selectors → Easy = 5, Quick = 5 → Effort Score = 25 points
            </p>
          </div>
        </div>

        <div className="border rounded-lg bg-red-50 p-6">
          <h3 className="font-semibold text-lg mb-3 text-red-800">✗ DON'T: Automate Unchanged Code</h3>
          <p className="text-muted-foreground mb-3">
            If functionality hasn't changed and is working well, automation may not add value.
            Consider exploratory testing instead.
          </p>
          <div className="bg-background border rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Smart Suggestion:</p>
            <p className="text-muted-foreground">
              The tool will warn you when unchanged functionality with high frequency scores low.
            </p>
          </div>
        </div>

        <div className="border rounded-lg bg-red-50 p-6">
          <h3 className="font-semibold text-lg mb-3 text-red-800">✗ DON'T: Ignore Legal Requirements</h3>
          <p className="text-muted-foreground mb-3">
            Where I work, Legal and compliance requirements must be automated regardless of score. The legal
            checkbox adds 20 points to ensure these are prioritised. The legal checkbox doesn't appear in the 'normal' view.
          </p>
          <div className="bg-background border rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Examples:</p>
            <ul className="text-muted-foreground list-disc list-inside space-y-1">
              <li>GDPR data deletion requests</li>
              <li>Ofcom requirements</li>
              <li>Legal things for your type of business</li>
            </ul>
          </div>
        </div>

        <div className="border rounded-lg bg-blue-50 p-6">
          <h3 className="font-semibold text-lg mb-3 text-blue-800">💡 TIP: Use Existing Functionality List</h3>
          <p className="text-muted-foreground mb-3">
            Track what's already implemented in the sidebar. This helps you:
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-1 ml-4">
            <li>Identify what's truly "new" vs. "modified"</li>
            <li>Reference implementation patterns for ease scoring</li>
            <li>Understand the full context of changes</li>
          </ul>
        </div>

        <div className="border rounded-lg bg-blue-50 p-6">
          <h3 className="font-semibold text-lg mb-3 text-blue-800">💡 TIP: Review Scores as a Team</h3>
          <p className="text-muted-foreground mb-3">
            Export your Prioritisation decisions and review them in sprint planning. The scores
            provide objective data, but team context matters too.
          </p>
          <div className="bg-background border rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Discussion Points:</p>
            <ul className="text-muted-foreground list-disc list-inside space-y-1">
              <li>Do the risk factors accurately reflect reality?</li>
              <li>Are there dependencies between tests?</li>
              <li>What's the team's current capacity?</li>
            </ul>
          </div>
        </div>

        <div className="border rounded-lg bg-purple-50 p-6">
          <h3 className="font-semibold text-lg mb-3 text-purple-800">🎯 GOAL: Maximize ROI</h3>
          <p className="text-muted-foreground">
            The goal isn't to automate everything - it's to automate the right things.
            Focus on tests that provide the most value relative to their cost.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FAQ Tab
// ============================================================================

function FAQTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">What is the "Gut Feel" column and should I use it?</h3>
          <p className="text-gray-700 mb-3">
            The Initial Judgment (Gut Feel) feature helps you learn from the scoring system by capturing
            your instinctive decision before seeing the calculated scores. It's optional but valuable for:
          </p>
          <ul className="text-gray-700 list-disc list-inside space-y-1 ml-4 mb-3">
            <li><strong>Learning:</strong> See when your gut feel matches or differs from objective scores</li>
            <li><strong>Identifying Biases:</strong> Discover which factors you naturally overweight or underweight</li>
            <li><strong>Building Trust:</strong> Gain confidence in the scoring system as you see it catch things you missed</li>
          </ul>
          <p className="text-gray-700 mb-3">
            When your gut feel doesn't match the calculated recommendation, you'll see a ⚠️ warning with an
            explanation. This is a learning opportunity, not an error!
          </p>
         </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">What if my test scores in the "MAYBE" range?</h3>
          <p className="text-gray-700">
            Tests in the 34-66 range require judgment. Consider your team's capacity, the test's
            maintenance cost, and whether it provides unique coverage. If you have automation
            capacity and the test is straightforward, go ahead. If resources are tight, focus
            on the "AUTOMATE" tier first.
          </p>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">Should I automate tests that score below 34?</h3>
          <p className="text-gray-700 mb-3">
            Generally no, unless there's a specific reason (like a legal requirement, which would
            add 20 points). Low-scoring tests often have:
          </p>
          <ul className="text-gray-700 list-disc list-inside space-y-1 ml-4">
            <li>Low usage frequency</li>
            <li>Low business impact</li>
            <li>Unchanged functionality</li>
            <li>High implementation complexity</li>
          </ul>
          <p className="text-gray-700 mt-3">
            These are better candidates for manual exploratory testing.
          </p>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">How do I determine "Usage Frequency"?</h3>
          <p className="text-gray-700 mb-3">
            Use this scale:
          </p>
          <ul className="text-gray-700 space-y-2 ml-4">
            <li><span className="font-bold">5 - Constant:</span> Used in every session (login, navigation)</li>
            <li><span className="font-bold">4 - Very Often:</span> Used multiple times per session</li>
            <li><span className="font-bold">3 - Often:</span> Used once per session typically</li>
            <li><span className="font-bold">2 - Sometimes:</span> Used occasionally</li>
            <li><span className="font-bold">1 - Rarely:</span> Edge case or admin-only feature</li>
          </ul>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">How do I determine "Impact if Broken"?</h3>
          <p className="text-gray-700 mb-3">
            Consider what happens if this functionality breaks:
          </p>
          <ul className="text-gray-700 space-y-2 ml-4">
            <li><span className="font-bold">5 - Critical:</span> Revenue loss, data loss, security breach</li>
            <li><span className="font-bold">4 - High:</span> Major workflow blocked, customer complaints</li>
            <li><span className="font-bold">3 - Medium:</span> Workaround exists, moderate inconvenience</li>
            <li><span className="font-bold">2 - Low:</span> Minor inconvenience, cosmetic issue</li>
            <li><span className="font-bold">1 - Minimal:</span> Barely noticeable, no real impact</li>
          </ul>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">What's the difference between change types?</h3>
          <div className="space-y-3">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <p className="font-bold text-sm text-green-800">New</p>
              <p className="text-sm text-gray-700 mt-1">
                Brand new functionality that didn't exist before. Highest risk of bugs.
              </p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
              <p className="font-bold text-sm text-yellow-800">Modified Behavior</p>
              <p className="text-sm text-gray-700 mt-1">
                Existing functionality with changed logic or workflow. High risk of regressions.
              </p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
              <p className="font-bold text-sm text-orange-800">Modified UI</p>
              <p className="text-sm text-gray-700 mt-1">
                Visual changes only, logic unchanged. Lower risk but still worth testing.
              </p>
            </div>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
              <p className="font-bold text-sm text-gray-800">Unchanged</p>
              <p className="text-sm text-gray-700 mt-1">
                No changes to this functionality. Lowest priority for automation.
              </p>
            </div>
          </div>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">What are the Implementation Types?</h3>
          <p className="text-gray-700 mb-3">
            Implementation types describe how the feature is built, which affects automation effort:
          </p>
          <ul className="text-gray-700 space-y-2 ml-4">
            <li><span className="font-bold">Standard Components:</span> Uses existing design system components - easiest to automate</li>
            <li><span className="font-bold">New Pattern:</span> New variation of existing patterns - moderate effort</li>
            <li><span className="font-bold">Custom Implementation:</span> Unique implementation built from scratch - highest effort</li>
            <li><span className="font-bold">Hybrid:</span> Combination of standard components and custom elements - moderate effort</li>
          </ul>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">How do I rate "Easy to Automate" and "Quick to Automate"?</h3>
          <p className="text-gray-700 mb-3">
            These two factors combine to create your Effort Score (0-25 points). Think of them separately:
          </p>
          <div className="space-y-3">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <p className="font-bold text-sm text-green-800 mb-2">Easy to Automate (Technical Complexity)</p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li><strong>5:</strong> Standard components, clear selectors, stable UI</li>
                <li><strong>3:</strong> Mix of standard and custom, some dynamic content</li>
                <li><strong>1:</strong> Complex custom implementation, inaccessible elements</li>
              </ul>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <p className="font-bold text-sm text-blue-800 mb-2">Quick to Automate (Time Investment)</p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li><strong>5:</strong> Under 1 hour (simple form, button click)</li>
                <li><strong>3:</strong> Half day (moderate workflow, some setup)</li>
                <li><strong>1:</strong> Multiple days (requires new infrastructure, research)</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-700 mt-3">
            <strong>Example:</strong> A standard login form might be Easy = 5 and Quick = 5 (25 points), 
            while a complex data visualization might be Easy = 2 and Quick = 1 (2 points).
          </p>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">Can I import test cases from external tools?</h3>
          <p className="text-gray-700 mb-3">
            Yes! If you use a scenario tool (like AI test generators or BDD tools), you can import scenarios
            using the <span className="font-bold text-blue-600">PASTE SCENARIO</span> button.
            Simply copy the scenario JSON to your clipboard and paste it into the tool.
          </p>
          <p className="text-gray-700 mb-3">
            Imported scenarios can include detected change types and implementation types, which will
            pre-fill the corresponding fields in your test case.
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Expected JSON format:</span>
          </p>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto mt-2">
{`{
  "scenarioId": "SCENARIO-123",
  "scenarioTitle": "User Login Test",
  "jiraTicket": "JIRA-456",
  "detectedCodeChange": "new",
  "detectedImplementation": "standard-components",
  "context": "Test description..."
}`}
          </pre>
          <p className="text-xs text-gray-600 mt-2">
            Alternative field names are supported: id/bertScenarioId, title/name, ticket, implementation/changeType
          </p>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">What's a state diagram and how do I use it?</h3>
          <p className="text-gray-700 mb-3">
            State diagrams are JSON files from model-based testing tools that describe your
            application's states and transitions. When you upload a state diagram:
          </p>
          <ol className="text-gray-700 list-decimal list-inside space-y-2 ml-4">
            <li>The tool compares it with the previous version (if exists)</li>
            <li>It identifies new, modified, and removed states</li>
            <li>It automatically generates test cases for changes</li>
            <li>It populates the existing functionality list</li>
          </ol>
          <p className="text-gray-700 mt-3">
            This saves significant time when working with model-based testing workflows.
          </p>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">Where is my data stored?</h3>
          <p className="text-gray-700 mb-3">
            All data is stored locally in your browser's localStorage. Nothing is sent to any server.
            Your test Prioritisation data stays on your machine.
          </p>
          <p className="text-gray-700">
            Use the <span className="font-bold">DOWNLOAD</span> button to export your data as JSON
            for backup, version control, or sharing with your team.
          </p>
        </div>

        <div className="border-2 border-slate-300 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">How do I share my Prioritisation with the team?</h3>
          <p className="text-gray-700 mb-3">
            Export your data as JSON and:
          </p>
          <ul className="text-gray-700 list-disc list-inside space-y-1 ml-4">
            <li>Commit it to your repository</li>
            <li>Share it via Slack/email</li>
            <li>Present it in sprint planning</li>
            <li>Use it as documentation for automation decisions</li>
          </ul>
          <p className="text-gray-700 mt-3">
            Team members can import the JSON file to see your Prioritisation and add their input.
          </p>
        </div>

        <div className="border-2 border-blue-300 rounded-lg bg-blue-50 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3 text-blue-800">Still have questions?</h3>
          <p className="text-gray-700">
            This tool implements Angie Jones' risk-based test automation methodology. For more
            details on the underlying approach, search for "Angie Jones test automation" or
            "risk-based testing" online.
          </p>
        </div>
      </div>
    </div>
  );
}
