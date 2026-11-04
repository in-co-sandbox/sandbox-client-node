/** Checks local binding names while preserving external payload property names. */
export const camelcaseRule = {
    meta: {
        type: 'suggestion',
        schema: [],
        messages: { invalidName: "Use camelCase or UPPER_SNAKE_CASE for '{{name}}'." },
    },
    create(context) {
        return {
            'Program:exit': function checkBindings(program) {
                const scopes = [context.sourceCode.getScope(program)];
                // Class declarations appear in both their enclosing and class scopes.
                const reportedOffsets = new Set();
                for (const scope of scopes) {
                    for (const binding of scope.variables) {
                        const name = binding.name.replace(/^_+|_+$/g, '');
                        if (name.includes('_') && name !== name.toUpperCase()) {
                            for (const identifier of binding.identifiers) {
                                if (!reportedOffsets.has(identifier.range[0])) {
                                    reportedOffsets.add(identifier.range[0]);
                                    context.report({
                                        node: identifier,
                                        messageId: 'invalidName',
                                        data: { name: binding.name },
                                    });
                                }
                            }
                        }
                    }
                    scopes.push(...scope.childScopes);
                }
            },
        };
    },
};
