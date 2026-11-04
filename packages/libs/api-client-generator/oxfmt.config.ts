import config from "@in-co-sandbox/oxfmt-config";

// The generator keeps its original layout: tabs, double quotes and unwrapped lines.
export default { ...config, useTabs: true, singleQuote: false, printWidth: 320, trailingComma: "es5" };
