/** Compile-time exhaustiveness check that also fails loudly at runtime. */
export function assertNever(value: never): never {
	throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}
