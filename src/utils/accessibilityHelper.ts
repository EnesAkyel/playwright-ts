import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface AccessibilityResult {
    violations: Violation[];
    passes: number;
    incomplete: number;
}

export interface Violation {
    id: string;
    impact: string | null;
    description: string;
    help: string;
    helpUrl: string;
    nodes: number;
}

export class AccessibilityHelper {

    /**
     * Run a full accessibility scan on the current page
     */
    static async scanPage(page: Page): Promise<AccessibilityResult> {
        const results = await new AxeBuilder({ page }).analyze();

        return {
            violations: results.violations.map(v => ({
                id: v.id,
                impact: v.impact ?? null,
                description: v.description,
                help: v.help,
                helpUrl: v.helpUrl,
                nodes: v.nodes.length,
            })),
            passes: results.passes.length,
            incomplete: results.incomplete.length,
        };
    }

    /**
     * Run accessibility scan on a specific element
     */
    static async scanElement(page: Page, selector: string): Promise<AccessibilityResult> {
        const results = await new AxeBuilder({ page })
            .include(selector)
            .analyze();

        return {
            violations: results.violations.map(v => ({
                id: v.id,
                impact: v.impact ?? null,
                description: v.description,
                help: v.help,
                helpUrl: v.helpUrl,
                nodes: v.nodes.length,
            })),
            passes: results.passes.length,
            incomplete: results.incomplete.length,
        };
    }

    /**
     * Run scan excluding known violations
     */
    static async scanPageExcluding(
        page: Page,
        excludeRules: string[]
    ): Promise<AccessibilityResult> {
        const results = await new AxeBuilder({ page })
            .disableRules(excludeRules)
            .analyze();

        return {
            violations: results.violations.map(v => ({
                id: v.id,
                impact: v.impact ?? null,
                description: v.description,
                help: v.help,
                helpUrl: v.helpUrl,
                nodes: v.nodes.length,
            })),
            passes: results.passes.length,
            incomplete: results.incomplete.length,
        };
    }

    /**
     * Print a human-readable summary of violations
     */
    static printViolations(result: AccessibilityResult): void {
        if (result.violations.length === 0) {
            console.log('\n✅ No accessibility violations found\n');
            return;
        }

        console.log(`\n─── Accessibility Violations (${result.violations.length}) ───`);
        result.violations.forEach(v => {
            console.log(`  [${v.impact?.toUpperCase()}] ${v.id}`);
            console.log(`    Description : ${v.description}`);
            console.log(`    Help        : ${v.help}`);
            console.log(`    Nodes       : ${v.nodes}`);
            console.log(`    More info   : ${v.helpUrl}`);
            console.log();
        });
        console.log('─────────────────────────────────────\n');
    }
}
