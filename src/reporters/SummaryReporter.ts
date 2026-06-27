import type { FullConfig, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

type TestRecord = {
    title: string;
    suite: string;
    status: string;
    durationMs: number;
    error?: string;
};

type SummaryOutput = {
    timestamp: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    totalDurationMs: number;
    averageDurationMs: number;
    slowestTests: TestRecord[];
    tests: TestRecord[];
};

class SummaryReporter implements Reporter {
    private records: TestRecord[] = [];
    private startTime = 0;

    onBegin(_config: FullConfig, suite: Suite) {
        this.startTime = Date.now();
        console.log(`\n[SummaryReporter] Running ${suite.allTests().length} tests`);
    }

    onTestEnd(test: TestCase, result: TestResult) {
        this.records.push({
            title: test.title,
            suite: test.parent?.title ?? '',
            status: result.status,
            durationMs: result.duration,
            error: result.errors[0]?.message?.split('\n')[0],
        });
    }

    onEnd() {
        const totalDurationMs = Date.now() - this.startTime;
        const passed = this.records.filter(r => r.status === 'passed').length;
        const failed = this.records.filter(r => r.status === 'failed').length;
        const skipped = this.records.filter(r => r.status === 'skipped').length;
        const flaky = this.records.filter(r => r.status === 'flaky').length;
        const total = this.records.length;
        const averageDurationMs = total > 0 ? Math.round(totalDurationMs / total) : 0;

        const slowestTests = [...this.records]
            .sort((a, b) => b.durationMs - a.durationMs)
            .slice(0, 5);

        const summary: SummaryOutput = {
            timestamp: new Date().toISOString(),
            total,
            passed,
            failed,
            skipped,
            flaky,
            totalDurationMs,
            averageDurationMs,
            slowestTests,
            tests: this.records,
        };

        const outDir = 'test-results';
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

        console.log('\n[SummaryReporter]');
        console.log(`  Total    : ${total}`);
        console.log(`  Passed   : ${passed}`);
        console.log(`  Failed   : ${failed}`);
        console.log(`  Skipped  : ${skipped}`);
        if (flaky > 0) console.log(`  Flaky    : ${flaky}`);
        console.log(`  Duration : ${(totalDurationMs / 1000).toFixed(1)}s`);
        if (slowestTests.length > 0) {
            console.log('  Slowest  :');
            slowestTests.forEach(t => {
                console.log(`    ${(t.durationMs / 1000).toFixed(1)}s  ${t.suite} > ${t.title}`);
            });
        }
        console.log(`  Summary  : test-results/summary.json`);
        console.log('[SummaryReporter]\n');
    }
}

export default SummaryReporter;
