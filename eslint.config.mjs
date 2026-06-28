import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['node_modules', 'dist', 'playwright-report', 'allure-report', 'test-results'],
    },
    ...tseslint.configs.recommended,
    {
        plugins: { playwright },
        rules: {
            ...playwright.configs['flat/recommended'].rules,
        },
    },
    {
        rules: {
            // TypeScript
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',

            // VisualHelper.compare* and AccessibilityHelper.scan* wrap expect() internally;
            // list explicit names because the plugin doesn't resolve member expressions via globs
            'playwright/expect-expect': [
                'warn',
                {
                    assertFunctionNames: [
                        'VisualHelper.compareFullPage',
                        'VisualHelper.compareElement',
                        'AccessibilityHelper.scanPage',
                        'AccessibilityHelper.scanPageExcluding',
                        'AccessibilityHelper.scanElement',
                    ],
                },
            ],

            'playwright/no-wait-for-timeout': 'warn',
            'playwright/no-networkidle': 'off',        // used intentionally in page objects
            'playwright/prefer-web-first-assertions': 'warn',
            'playwright/no-conditional-in-test': 'warn',
            'playwright/prefer-locator': 'off',        // page objects legitimately use page methods

            // allowConditional: test.skip(browserName !== 'chromium') is the correct
            // Playwright pattern for browser-specific tests — not a hidden skip
            'playwright/no-skipped-test': ['warn', { allowConditional: true }],

            // false positive: flags toHaveLength on plain JS arrays, not just locators
            'playwright/prefer-to-have-count': 'off',
        },
    },
    prettierConfig,
);
