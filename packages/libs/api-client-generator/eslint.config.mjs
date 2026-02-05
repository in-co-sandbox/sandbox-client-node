import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";

export default [
	{
		ignores: [
			"dist/",
			"node_modules/",
			".eslintrc.js",
			"*.config.js",
			"tests/**",
			"generated/**",
		],
	},

	// Main configuration for source files
	{
		files: ["**/*.{js,ts,jsx,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			import: importPlugin,
			prettier: prettierPlugin,
		},
		rules: {
			"@typescript-eslint/no-shadow": "warn",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"no-shadow": "off",
			"no-console": "off",
			"prefer-const": "error",
			"no-var": "error",
			"import/no-unresolved": "off",
			"no-restricted-syntax": "off",
			"class-methods-use-this": "off",
			"import/extensions": "off",
			"import/prefer-default-export": "off",
			"dot-notation": "off",
			"object-shorthand": "off",
			"prettier/prettier": "warn",
		},
		settings: {
			"import/resolver": {
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx"],
				},
			},
		},
	},
];