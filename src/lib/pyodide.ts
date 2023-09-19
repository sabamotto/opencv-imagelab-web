export interface Pyodide {
	checkInterrupt: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	isPyProxy: (jsobj: any) => boolean;
	loadPackage: (packages: string[]) => Promise<void>;
	loadPackagesFromImports: (
		code: string,
		options?: {
			checkIntegrity: boolean;
			errorCallback: (message: string) => void;
			messageCallback: (message: string) => void;
		}
	) => Promise<void>;
	mountNativeFS: (
		path: string,
		fileSystemHandle: FileSystemDirectoryHandle
	) => Promise<{ syncfs: () => Promise<void> }>;
	pyimport: (pkg: string) => PyProxy;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	registerComlink: (comlink: any) => void;
	registerJsModule: (name: string, module: object) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	runPython(code: string, options?: RunPythonOptions): any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	runPythonAsync: (code: string, options?: RunPythonOptions) => Promise<any>;
	setDebug: (debug: boolean) => boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setInterruptBuffer: (interrupt_buffer: Array<any>) => void;
	setStderr: (options: StdoutHandlerOptions) => void;
	setStdin: (options: StdinHandlerOptions) => void;
	setStdout: (options: StdoutHandlerOptions) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toPy: (obj: any, options?: PyConversionOptions) => any;
	unpackArchive: (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		buffer: TypedArray | Array<any>,
		format: string,
		options?: { extractDir: string }
	) => void;
	unregisterJsModule: (name: string) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	globals: any;
	version: string;
	FS: {
		readFile: (name: string, options: unknown) => void;
		writeFile: (name: string, data: string, options: unknown) => void;
		mkdir: (name: string) => void;
		rmdir: (name: string) => void;
	};
}

export interface PyProxy {
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toJs: (options?: unknown) => any;
	toString: () => string;
}

export interface PyBuffer extends PyProxy {
	getBuffer: (type: string) => PyBufferView;
}

export interface PyBufferView {
	c_contiguous: boolean;
	data: TypedArray;
	f_contiguous: boolean;
	format: string;
	itemsize: number;
	nbytes: number;
	ndim: number;
	offset: number;
	readonly: boolean;
	shape: number[];
	strides: number[];
	release: () => void;
}

export interface PyDict extends PyProxy {}

export interface PythonError {
	type: string;
}

type TypedArray =
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array;

type RunPythonOptions = {
	filename?: string;
	globals?: PyProxy;
	locals?: PyProxy;
};

type StdoutHandlerOptions = {
	isatty: boolean;
	batched: (output: string) => void;
	raw: (charCode: number) => void;
	write: (buffer: Uint8Array) => number;
};

type StdinHandlerOptions = {
	autoEOF: boolean;
	error: boolean;
	isatty: boolean;
	stdin: () => null | undefined | string | TypedArray | Uint8Array;
	read: (buffer: Uint8Array) => number;
};

type PyConversionOptions = {
	depth: number;
	defaultConverter: (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		value: any,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		converter: (value: any) => any,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cacheConversion: (input: any, output: any) => void
	) => void;
};
