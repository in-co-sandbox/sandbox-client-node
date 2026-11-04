import { fileURLToPath } from 'node:url';

/** Sandbox Node.js and TypeScript rules. Turbo boundaries owns package import checks. */
/** @type {import("oxlint").OxlintConfig} */
const oxlintConfig = {
    plugins: ['typescript', 'import', 'node'],
    options: {
        typeAware: true,
    },
    jsPlugins: [{ name: 'sandbox', specifier: fileURLToPath(new URL('./plugin/index.js', import.meta.url)) }],
    // Keep only the rules migrated from our previous configuration.
    categories: {
        correctness: 'off',
    },
    env: {
        builtin: true,
        node: true,
        es2022: true,
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
    rules: {
        // Keep payload property names; require camelcase for local bindings.
        'sandbox/camelcase': 'error',
        // Use brackets only when dot access cannot express the property safely.
        'typescript/dot-notation': ['error', { allowKeywords: true }],
        'typescript/consistent-return': 'error',
        'array-callback-return': [
            'error',
            {
                allowImplicit: true,
                checkForEach: false,
                allowVoid: false,
            },
        ],
        'block-scoped-var': 'error',
        'default-case': [
            'error',
            {
                commentPattern: '^no default$',
            },
        ],
        'default-case-last': 'error',
        'default-param-last': 'error',
        eqeqeq: [
            'error',
            'always',
            {
                null: 'ignore',
            },
        ],
        'grouped-accessor-pairs': [
            'error',
            'anyOrder',
            {
                enforceForTSTypes: false,
            },
        ],
        'guard-for-in': 'error',
        'max-classes-per-file': ['error', 1],
        'no-alert': 'warn',
        'no-caller': 'error',
        'no-case-declarations': 'error',
        'no-constructor-return': 'error',
        'no-else-return': [
            'error',
            {
                allowElseIf: false,
            },
        ],
        'no-empty-function': [
            'error',
            {
                allow: ['arrowFunctions', 'functions', 'methods'],
            },
        ],
        'no-empty-pattern': [
            'error',
            {
                allowObjectPatternsAsParameters: false,
            },
        ],
        'no-eval': [
            'error',
            {
                allowIndirect: false,
            },
        ],
        'no-extend-native': [
            'error',
            {
                exceptions: [],
            },
        ],
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        'no-fallthrough': [
            'error',
            {
                allowEmptyCase: false,
                reportUnusedFallthroughComment: false,
            },
        ],
        'no-global-assign': [
            'error',
            {
                exceptions: [],
            },
        ],
        'no-implied-eval': 'error',
        'no-iterator': 'error',
        'no-labels': [
            'error',
            {
                allowLoop: false,
                allowSwitch: false,
            },
        ],
        'no-lone-blocks': 'error',
        'no-loop-func': 'error',
        'no-multi-str': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-nonoctal-decimal-escape': 'error',
        'no-param-reassign': [
            'error',
            {
                props: true,
                ignorePropertyModificationsFor: [
                    'acc',
                    'accumulator',
                    'e',
                    'ctx',
                    'context',
                    'req',
                    'request',
                    'res',
                    'response',
                    '$scope',
                    'staticContext',
                ],
            },
        ],
        'no-proto': 'error',
        'no-redeclare': [
            'error',
            {
                builtinGlobals: true,
            },
        ],
        'no-restricted-properties': [
            'error',
            {
                object: 'arguments',
                property: 'callee',
                message: 'arguments.callee is deprecated',
            },
            {
                object: 'global',
                property: 'isFinite',
                message: 'Please use Number.isFinite instead',
            },
            {
                object: 'self',
                property: 'isFinite',
                message: 'Please use Number.isFinite instead',
            },
            {
                object: 'window',
                property: 'isFinite',
                message: 'Please use Number.isFinite instead',
            },
            {
                object: 'global',
                property: 'isNaN',
                message: 'Please use Number.isNaN instead',
            },
            {
                object: 'self',
                property: 'isNaN',
                message: 'Please use Number.isNaN instead',
            },
            {
                object: 'window',
                property: 'isNaN',
                message: 'Please use Number.isNaN instead',
            },
            {
                property: '__defineGetter__',
                message: 'Please use Object.defineProperty instead.',
            },
            {
                property: '__defineSetter__',
                message: 'Please use Object.defineProperty instead.',
            },
            {
                object: 'Math',
                property: 'pow',
                message: 'Use the exponentiation operator (**) instead.',
            },
        ],
        'no-return-assign': ['error', 'always'],
        'no-script-url': 'error',
        'no-self-assign': [
            'error',
            {
                props: true,
            },
        ],
        'no-self-compare': 'error',
        'no-sequences': [
            'error',
            {
                allowInParentheses: true,
            },
        ],
        'no-throw-literal': 'error',
        'no-unused-expressions': [
            'error',
            {
                allowShortCircuit: false,
                allowTaggedTemplates: false,
                allowTernary: false,
            },
        ],
        'no-unused-labels': 'error',
        'no-useless-catch': 'error',
        'no-useless-concat': 'error',
        'no-useless-escape': [
            'error',
            {
                allowRegexCharacters: [],
            },
        ],
        'no-useless-return': 'error',
        'no-void': [
            'error',
            {
                allowAsStatement: false,
            },
        ],
        'no-with': 'error',
        'prefer-promise-reject-errors': [
            'error',
            {
                allowEmptyReject: true,
            },
        ],
        'prefer-regex-literals': [
            'error',
            {
                disallowRedundantWrapping: true,
            },
        ],
        radix: ['error', 'always'],
        'vars-on-top': 'error',
        yoda: [
            'error',
            'never',
            {
                exceptRange: false,
                onlyEquality: false,
            },
        ],
        'for-direction': 'error',
        'getter-return': [
            'error',
            {
                allowImplicit: true,
            },
        ],
        'no-async-promise-executor': 'error',
        'no-await-in-loop': 'error',
        'no-compare-neg-zero': 'error',
        'no-cond-assign': ['error', 'always'],
        // Reject every console method, including warn and error.
        'no-console': ['error', {}],
        'no-constant-condition': [
            'warn',
            {
                checkLoops: 'allExceptWhileTrue',
            },
        ],
        'no-control-regex': 'error',
        'no-debugger': 'error',
        'no-dupe-else-if': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-empty': [
            'error',
            {
                allowEmptyCatch: false,
            },
        ],
        'no-empty-character-class': 'error',
        'no-ex-assign': 'error',
        'no-extra-boolean-cast': ['error', {}],
        'no-func-assign': 'error',
        'no-import-assign': 'error',
        'no-inner-declarations': [
            'error',
            'functions',
            {
                blockScopedFunctions: 'allow',
            },
        ],
        'no-invalid-regexp': ['error', {}],
        'no-irregular-whitespace': [
            'error',
            {
                skipComments: false,
                skipJSXText: false,
                skipRegExps: false,
                skipStrings: true,
                skipTemplates: false,
            },
        ],
        'no-loss-of-precision': 'error',
        'no-misleading-character-class': [
            'error',
            {
                allowEscape: false,
            },
        ],
        'no-obj-calls': 'error',
        'no-promise-executor-return': [
            'error',
            {
                allowVoid: false,
            },
        ],
        'no-prototype-builtins': 'error',
        'no-regex-spaces': 'error',
        'no-setter-return': 'error',
        'no-sparse-arrays': 'error',
        'no-template-curly-in-string': 'error',
        'no-unreachable': 'error',
        'no-unreachable-loop': [
            'error',
            {
                ignore: [],
            },
        ],
        'no-unsafe-finally': 'error',
        'no-unsafe-negation': [
            'error',
            {
                enforceForOrderingRelations: false,
            },
        ],
        'no-unsafe-optional-chaining': [
            'error',
            {
                disallowArithmeticOperators: true,
            },
        ],
        'no-useless-backreference': 'error',
        'use-isnan': [
            'error',
            {
                enforceForIndexOf: false,
                enforceForSwitchCase: true,
            },
        ],
        'valid-typeof': [
            'error',
            {
                requireStringLiterals: true,
            },
        ],
        'func-names': ['warn', 'always', {}],
        'new-cap': [
            'error',
            {
                capIsNew: false,
                capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
                newIsCap: true,
                newIsCapExceptions: [],
                properties: true,
            },
        ],
        'no-array-constructor': 'error',
        'no-bitwise': [
            'error',
            {
                allow: [],
                int32Hint: false,
            },
        ],
        'no-continue': 'error',
        'no-lonely-if': 'error',
        'no-multi-assign': [
            'error',
            {
                ignoreNonDeclaration: false,
            },
        ],
        'no-nested-ternary': 'error',
        'no-plusplus': [
            'error',
            {
                allowForLoopAfterthoughts: false,
            },
        ],
        'no-underscore-dangle': [
            'error',
            {
                allow: [],
                allowAfterSuper: false,
                allowAfterThis: false,
                allowAfterThisConstructor: false,
                allowFunctionParams: true,
                allowInArrayDestructuring: true,
                allowInObjectDestructuring: true,
                enforceInClassFields: false,
                enforceInMethodNames: true,
            },
        ],
        'no-unneeded-ternary': [
            'error',
            {
                defaultAssignment: false,
            },
        ],
        'one-var': ['error', 'never'],
        'operator-assignment': ['error', 'always'],
        'prefer-exponentiation-operator': 'error',
        'prefer-object-spread': 'error',
        'unicode-bom': ['error', 'never'],
        'no-delete-var': 'error',
        'no-label-var': 'error',
        'no-restricted-globals': [
            'error',
            {
                name: 'isFinite',
                message: 'Use Number.isFinite instead https://github.com/airbnb/javascript#standard-library--isfinite',
            },
            {
                name: 'isNaN',
                message: 'Use Number.isNaN instead https://github.com/airbnb/javascript#standard-library--isnan',
            },
            'addEventListener',
            'blur',
            'close',
            'closed',
            'confirm',
            'defaultStatus',
            'defaultstatus',
            'event',
            'external',
            'find',
            'focus',
            'frameElement',
            'frames',
            'history',
            'innerHeight',
            'innerWidth',
            'length',
            'location',
            'locationbar',
            'menubar',
            'moveBy',
            'moveTo',
            'name',
            'onblur',
            'onerror',
            'onfocus',
            'onload',
            'onresize',
            'onunload',
            'open',
            'opener',
            'opera',
            'outerHeight',
            'outerWidth',
            'pageXOffset',
            'pageYOffset',
            'parent',
            'print',
            'removeEventListener',
            'resizeBy',
            'resizeTo',
            'screen',
            'screenLeft',
            'screenTop',
            'screenX',
            'screenY',
            'scroll',
            'scrollbars',
            'scrollBy',
            'scrollTo',
            'scrollX',
            'scrollY',
            'self',
            'status',
            'statusbar',
            'stop',
            'toolbar',
            'top',
        ],
        // Reject inner variables that hide an outer variable.
        'no-shadow': 'error',
        'no-shadow-restricted-names': [
            'error',
            {
                reportGlobalThis: false,
            },
        ],
        'no-undef': [
            'error',
            {
                typeof: false,
            },
        ],
        // Allow unused _ parameters and catch parameters.
        'no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                caughtErrors: 'none',
            },
        ],
        // Allow hoisted functions. Check variables and classes before use.
        'no-use-before-define': [
            'error',
            {
                functions: false,
            },
        ],
        'arrow-body-style': [
            'error',
            'as-needed',
            {
                requireReturnForObjectLiteral: false,
            },
        ],
        'constructor-super': 'error',
        'no-class-assign': 'error',
        'no-const-assign': 'error',
        'no-dupe-class-members': 'error',
        'no-restricted-exports': [
            'error',
            {
                restrictedNamedExports: ['default', 'then'],
            },
        ],
        'no-this-before-super': 'error',
        'no-useless-computed-key': [
            'error',
            {
                enforceForClassMembers: true,
            },
        ],
        'no-useless-constructor': 'error',
        'no-useless-rename': [
            'error',
            {
                ignoreDestructuring: false,
                ignoreImport: false,
                ignoreExport: false,
            },
        ],
        'no-var': 'error',
        'object-shorthand': [
            'error',
            'always',
            {
                ignoreConstructors: false,
                avoidQuotes: true,
            },
        ],
        'prefer-arrow-callback': [
            'error',
            {
                allowNamedFunctions: false,
                allowUnboundThis: true,
            },
        ],
        'prefer-const': [
            'error',
            {
                destructuring: 'any',
                ignoreReadBeforeAssign: true,
            },
        ],
        'prefer-destructuring': [
            'error',
            {
                VariableDeclarator: {
                    array: false,
                    object: true,
                },
                AssignmentExpression: {
                    array: true,
                    object: false,
                },
            },
            {
                enforceForRenamedProperties: false,
            },
        ],
        'prefer-numeric-literals': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'require-yield': 'error',
        'symbol-description': 'error',
        'import/named': 'error',
        'import/export': 'error',
        'import/no-named-as-default': 'error',
        'import/no-named-as-default-member': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-amd': 'error',
        'import/first': 'error',
        'import/no-duplicates': 'error',
        // Omit extensions in local imports. Package imports are exempt.
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                mjs: 'never',
                cjs: 'never',
                ts: 'never',
            },
        ],
        'import/newline-after-import': 'error',
        'import/no-absolute-path': 'error',
        'import/no-dynamic-require': 'error',
        'import/no-webpack-loader-syntax': 'error',
        'import/no-named-default': 'error',
        'import/no-self-import': 'error',
        'import/no-cycle': [
            'error',
            {
                ignoreExternal: false,
                allowUnsafeDynamicCyclicDependency: false,
            },
        ],
        'typescript/ban-ts-comment': 'error',
        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-empty-object-type': 'error',
        'typescript/no-explicit-any': 'error',
        'typescript/no-extra-non-null-assertion': 'error',
        'typescript/no-misused-new': 'error',
        'typescript/no-namespace': 'error',
        'typescript/no-non-null-asserted-optional-chain': 'error',
        'typescript/no-require-imports': 'error',
        'typescript/no-this-alias': 'error',
        'typescript/no-unnecessary-type-constraint': 'error',
        'typescript/no-unsafe-declaration-merging': 'error',
        'typescript/no-unsafe-function-type': 'error',
        'typescript/no-wrapper-object-types': 'error',
        'typescript/prefer-as-const': 'error',
        'typescript/prefer-namespace-keyword': 'error',
        'typescript/triple-slash-reference': 'error',
        'node/global-require': 'error',
        'node/no-new-require': 'error',
        'node/no-path-concat': 'error',
        'no-new-native-nonconstructor': 'error',
        // Converter interfaces require instance methods even without this.
        'class-methods-use-this': 'off',
        // Allow named exports when a file exports one symbol.
        'import/prefer-default-export': 'off',
    },
    overrides: [
        {
            files: ['**/*.{js,mjs,cjs}', '**/*.config.ts'],
            rules: {
                // Native Node.js config loading requires explicit file extensions.
                'import/extensions': [
                    'error',
                    'ignorePackages',
                    { js: 'always', mjs: 'always', cjs: 'always', ts: 'always' },
                ],
            },
        },
        {
            files: ['**/tests/**/*.test.ts'],
            rules: { 'max-classes-per-file': 'off' },
        },
        {
            files: ['**/tests/**/*.contract.ts'],
            rules: { 'no-void': ['error', { allowAsStatement: true }] },
        },
        {
            files: ['**/tests/workflow/**/*.test.ts'],
            // These tests execute ASL states sequentially and assert Terraform template strings.
            rules: { 'no-await-in-loop': 'off', 'no-template-curly-in-string': 'off' },
        },
        {
            files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
            rules: {
                'no-redeclare': 'off',
                'no-with': 'off',
                'getter-return': 'off',
                'no-dupe-keys': 'off',
                'no-func-assign': 'off',
                'no-import-assign': 'off',
                'no-obj-calls': 'off',
                'no-setter-return': 'off',
                'no-unreachable': 'off',
                'no-unsafe-negation': 'off',
                'no-undef': 'off',
                'constructor-super': 'off',
                'no-class-assign': 'off',
                'no-const-assign': 'off',
                'no-dupe-class-members': 'off',
                'no-this-before-super': 'off',
                'no-new-native-nonconstructor': 'off',
            },
        },
    ],
};

export default oxlintConfig;
