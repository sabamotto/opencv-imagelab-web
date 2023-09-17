interface Pyodide {
	loadPackage: (packages: string[]) => Promise<void>;
	pyimport: (pkg: string) => micropip;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	runPython(code: string, namespace?: any): unknown;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	runPythonAsync: (code: string, namespace?: any) => Promise<any>;
	version: string;
	FS: {
		readFile: (name: string, options: unknown) => void;
		writeFile: (name: string, data: string, options: unknown) => void;
		mkdir: (name: string) => void;
		rmdir: (name: string) => void;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	globals: any;
	isPyProxy: (value: unknown) => boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	registerJsModule: any;
}

interface micropip {
	install: (packages: string[]) => Promise<void>;
}

interface PyProxy {
	type: string;
	copy: () => PyProxy;
	destroy: (options?: unknown) => void;
	isAwaitable: () => boolean;
	isBuffer: () => boolean;
	isCallable: () => boolean;
	isIterable: () => boolean;
	isIterator: () => boolean;
	supportsGet: () => boolean;
	supportsHas: () => boolean;
	supportsLength: () => boolean;
	supportsSet: () => boolean;
	toJs: (options?: unknown) => any;
	toString: () => string;
}
