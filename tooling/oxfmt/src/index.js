/** Four-space formatting with package and relative import groups; type-only imports stay in their source group. */
/** @type {import("oxfmt").OxfmtConfig} */
const oxfmtConfig = {
    tabWidth: 4,
    singleQuote: true,
    useTabs: false,
    printWidth: 120,
    trailingComma: 'all',
    sortPackageJson: false,
    sortImports: {
        groups: [
            ['builtin', 'external', 'internal'],
            ['parent', 'sibling', 'index', 'subpath', 'style', 'unknown'],
        ],
        newlinesBetween: false,
        sortSideEffects: false,
    },
    ignorePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.build/**',
        '**/.turbo/**',
        '**/generated/**',
        '**/coverage/**',
        '**/cicd/**',
        '**/resources/**',
    ],
};

export default oxfmtConfig;
