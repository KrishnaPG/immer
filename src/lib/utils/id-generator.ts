export function generateId(prefix: string = "", now: number = Date.now()) {
	const joiner = prefix?.length && !prefix.endsWith("-") ? "-" : "";
	return `${prefix}${joiner}${now.toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
