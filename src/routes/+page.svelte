<script lang="ts">
	import Prism from 'prismjs';
	import 'prismjs/components/prism-python';
	import 'prismjs/themes/prism-okaidia.css';

	import { onMount, tick } from 'svelte';
	import type { ComponentType } from 'svelte';

	import type { PyBuffer, Pyodide, PyProxy } from '$lib/pyodide';

	const pyHeader = `# JS-Python proxy code
def display(img):
	"""Send into canvas"""
	import numpy as np
	from cvlab import display_raw_image
	if img.dtype == np.float64:
		img = ((img + 1) * 127.5).astype(np.uint8)
	assert img.dtype == np.uint8
	h, w, depth = img.shape
	if depth in (1, 3):
		mask = np.ones((h, w, 1), dtype=np.uint8)
		mask.fill(255)
		if depth == 1:
			img = np.dstack((img, img, img, mask))
		elif depth == 3:
			img = np.dstack((img[...,::-1], mask))
	display_raw_image(np.ravel(img).tobytes(), w, h)

async def imread_picsum(path, flags:int=1):
	import cv2
	import numpy as np
	from pyodide.http import pyfetch
	print("Download picsum image..")
	res = await pyfetch(f"https://picsum.photos/{path}")
	buf = bytearray(await res.bytes())
	arr = np.asarray(buf, dtype=np.uint8)
	return cv2.imdecode(arr, flags)

# Your code here
`;
	let code = `import cv2
import numpy as np

# Get a random 256px square image
img = await imread_picsum(256)
# Or specified image from picsum.photos
#img = await imread_picsum("id/20/256/256")

# Your image-effect
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

	let mainCanvas: HTMLCanvasElement;
	let scaleFactor = 1;
	let canvasWidth: number = 256;
	let canvasHeight: number = 256;
	let canExecute = false;
	onMount(async () => {
		scaleFactor = window.devicePixelRatio;

		CodeJar = (await import('@novacbn/svelte-codejar')).CodeJar;
		pyLog[0][1] += 'OK';

		await pushPyLog(0, 'Initialize Pyodide.. ');
		pyodide = await window.loadPyodide({
			stdout: (msg) => pushPyLog(1, msg),
			stderr: (msg) => pushPyLog(2, msg)
		});
		pyodide.registerJsModule('cvlab', {
			display_raw_image: (bytes: PyBuffer, width: number, height: number) => {
				const buffer = bytes.getBuffer('u8clamped');
				bytes.destroy();
				try {
					const data = new ImageData(buffer.data as Uint8ClampedArray, width, height);
					const ctx = mainCanvas.getContext('2d');
					if (!ctx) throw new Error('Failed to create canvas context.');
					ctx.putImageData(data, 0, 0);
					scaleFactor = window.devicePixelRatio;
				} finally {
					buffer.release();
				}
			}
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
			<label for="HeaderVisible" class="flex items-center space-x-2 select-none">
				<input
					class="checkbox disabled:variant-soft-primary text-gray-500"
					type="checkbox"
					id="HeaderVisible"
					bind:checked={headerVisible}
					disabled={hasCustomHeader}
					on:change={changeHeaderVisible}
				/>
				<span>Display header code</span>
			</label>
			<button
				class="btn btn-sm variant-filled-primary"
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
							class="py-1 m-1 border-b-blue-600 border-b-[1px] last:border-b-0 logtype-{type} hover:bg-slate-800"
						>
							<pre class="inline whitespace-pre-wrap break-words">{record}</pre>
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
					width={canvasWidth}
					height={canvasHeight}
					class="mx-auto max-w-[30vw] max-h-[30vw] bg-gray-400 outline-1 outline-black"
					style="width: {canvasWidth / scaleFactor}px; height: {canvasHeight / scaleFactor}px;"
					bind:this={mainCanvas}
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
