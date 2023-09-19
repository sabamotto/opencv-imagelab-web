<script lang="ts">
	import Prism from 'prismjs';
	import 'prismjs/components/prism-python';
	import 'prismjs/themes/prism-okaidia.css';
	import { onMount, tick } from 'svelte';
	import type { ComponentType } from 'svelte';
	import type { Pyodide, PyProxy } from '$lib/pyodide';

	const scaleFactor = window.devicePixelRatio;

	const pyHeader = `# JS-Python proxy code
def display(img):
	"""Send into canvas"""
	import numpy as np
	from js import document, window, ImageData
	from pyodide.ffi import create_proxy
	if img.dtype == np.float64:
		img = ((img + 1) * 127.5).astype(np.uint8)
	assert img.dtype == np.uint8
	h, w, depth = img.shape
	if depth == 3:
		mask = np.ones((h, w, 1), dtype=np.uint8)
		mask.fill(255)
		img = np.dstack((img, mask))
	pix_proxy = create_proxy(np.ravel(img).tobytes())
	pix_buffer = pix_proxy.getBuffer("u8clamped")
	data = ImageData.new(pix_buffer.data, w, h)
	canvas = document.getElementById("MainCanvas")
	scaleFactor = window.devicePixelRatio
	canvas.width = w
	canvas.height = h
	canvas.style.width = f"{w / scaleFactor}px"
	canvas.style.height = f"{h / scaleFactor}px"
	ctx = canvas.getContext("2d")
	ctx.putImageData(data, 0, 0)
	pix_buffer.release()
	pix_proxy.destroy()

# Your code here
`;
	let code = `import cv2
import numpy as np

img = np.random.randint(256, size=(256, 256, 3), dtype=np.uint8)
img = cv2.medianBlur(img, 5)
print(f"first pixel: {img[0, 0]}")
display(img)`;

	let headerVisible = false;
	$: hasCustomHeader = headerVisible && code.indexOf(pyHeader) === -1;

	const changeHeaderVisible = () => {
		if (headerVisible) {
			code = `${pyHeader}${code}`;
		} else {
			code = code.replace(pyHeader, '');
		}
	};

	let CodeJar: ComponentType;
	let pyodide: Pyodide;
	let pyLog = [[0, 'Initialize Editor.. ']];
	let pyLogView: HTMLUListElement;
	let lastPyLog = 0;

	const pushPyLog = async (type: number, message: string) => {
		const now = Date.now();
		if (pyLog.length > 0 && pyLog[pyLog.length - 1][0] === type && now - lastPyLog < 2) {
			pyLog[pyLog.length - 1][1] += `\n${message}`;
		} else {
			pyLog.push([type, message]);
			pyLog = pyLog;
		}
		lastPyLog = now;
		await tick();
		pyLogView.scrollTo(0, pyLogView.scrollHeight);
	};

	const highlight = (code: string, syntax: string) =>
		Prism.highlight(code, Prism.languages[syntax], syntax);

	const execCode = async () => {
		pyLog = [];
		const ns = pyodide.globals.get('dict')() as PyProxy;
		try {
			if (!headerVisible) {
				await pyodide.runPythonAsync(pyHeader, {
					filename: '<opencv_imagelab>',
					globals: ns
				});
			}
			await pyodide.runPythonAsync(code, { filename: '<main>', globals: ns });
		} catch (e: unknown) {
			if (e instanceof Error) await pushPyLog(2, e.message);
			else console.trace(e);
		}
		ns.destroy();
	};

	let canExecute = false;
	onMount(async () => {
		CodeJar = (await import('@novacbn/svelte-codejar')).CodeJar;
		pyLog[0][1] += 'OK';

		await pushPyLog(0, 'Initialize Pyodide.. ');
		pyodide = await window.loadPyodide({
			stdout: (msg) => pushPyLog(1, msg),
			stderr: (msg) => pushPyLog(2, msg)
		});
		pyLog[pyLog.length - 1][1] += 'OK';

		await pushPyLog(0, 'Load packages.. ');
		await pyodide.loadPackage(['opencv-python']);
		pyLog[pyLog.length - 1][1] += 'OK';

		await pushPyLog(0, 'Completed.');

		const ns = pyodide.globals.get('dict')() as PyProxy;
		const bannerCode = 'from pyodide.console import BANNER;BANNER';
		const banner = (await pyodide.runPythonAsync(bannerCode, { globals: ns })) as string;
		ns.destroy();
		await pushPyLog(1, banner.split('\n', 1)[0]);
		canExecute = true;
	});
</script>

<div
	class="lg:h-full p-10 grid lg:grid-cols-[min-content_1fr_auto] md:grid-cols-1 gap-8 md:container md:mx-auto"
>
	<div class="h-full flex lg:flex-col md:flex-row lg:place-content-end lg:gap-0 md:gap-2">
		<h1 class="grow-0 h1 text-yellow-100">CV</h1>
		<h1 class="grow-0 h1 text-green-100">Lab</h1>
	</div>
	<div class="relative lg:h-full md:h-60 rounded-md overflow-hidden font-mono text-sm">
		{#if CodeJar}
			<div
				class="absolute left-0 top-0 right-0 bottom-0 overflow-y-scroll grid grid-cols-1 mt-[-0.5em]"
			>
				<svelte:component
					this={CodeJar}
					class="h-[99%]"
					syntax="python"
					catchTab
					{highlight}
					bind:value={code}
					withLineNumbers
				/>
			</div>
		{:else}
			<textarea class="textarea my-[0.5em] w-full h-full overflow-y-auto bg-[rgb(39,40,34)] p-4"
				>{code}</textarea
			>
		{/if}
	</div>
	<div
		class="lg:h-full md:h-96 relative grid grid-col-1 lg:grid-rows-[1fr_min-content] lg:grid-cols-1 md:grid-cols-[1fr_min-content] gap-y-2 lg:gap-x-0 md:gap-x-4"
	>
		<div class="grid grid-rows-[min-content_min-content_1fr] gap-y-2">
			<label for="WrapperVisible" class="flex items-center space-x-2 select-none">
				<input
					class="checkbox disabled:variant-soft-primary text-gray-500"
					type="checkbox"
					name="wrapper_visible"
					id="WrapperVisible"
					bind:checked={headerVisible}
					disabled={hasCustomHeader}
					on:change={changeHeaderVisible}
				/>
				<span>Display wrapper code</span>
			</label>
			<button
				class="btn btn-sm variant-soft-primary"
				on:click|preventDefault={execCode}
				disabled={!canExecute}
			>
				Execute
			</button>
			<div class="relative variant-ghost-primary rounded-md overflow-hidden">
				<ul
					bind:this={pyLogView}
					class="absolute left-1 top-1 right-1 bottom-1 text-xs font-mono whitespace-pre scroll-smooth overflow-auto"
				>
					{#each pyLog as [type, record]}
						<li
							class="py-1 m-1 border-b-blue-600 border-b-[1px] last:border-b-0 logtype-{type} hover:bg-slate-800 whitespace-normal"
						>
							{record}
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<div class="text-sm">
			<h1
				class="inline-block px-4 font-bold capitalize bg-blue-800 rounded-t-sm border-b-2 border-b-sky-400"
			>
				Output
			</h1>
			<div class="min-w-[200px] p-2 variant-outline-primary">
				<canvas
					id="MainCanvas"
					width="256"
					height="256"
					class="mx-auto bg-gray-400 outline-1 outline-black"
					style="width: {256 / scaleFactor}px; height: {256 / scaleFactor}px;"
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.logtype-0 {
		color: white;
	}
	.logtype-1 {
		color: skyblue;
	}
	.logtype-2 {
		color: #f88;
	}
</style>
