// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	interface Window {
		loadPyodide: ({
			stdout
		}: {
			stdin?: (msg: string) => void;
			stdout?: (msg: string) => void;
			stderr?: (msg: string) => void;
		}) => Promise<Pyodide>;
	}
}

export {};
