<script lang="ts">
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';

	// Dependences
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faXTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<img src="/icon.png" alt="OpenCV ImageLab Icon" class="w-10 h-10 mr-2" />
				<strong class="text-xl uppercase">OpenCV ImageLab Web</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn-icon hover:variant-soft-primary"
					href="https://github.com/sabamotto/opencv-imagelab-web"
					target="_blank"
					rel="noreferrer"
				>
					<Fa icon={faGithub} size="lg" class="inline-block" />
				</a>
				<a
					class="btn-icon hover:variant-soft-primary"
					href="https://twitter.com/sabamotto"
					target="_blank"
					rel="noreferrer"
				>
					<Fa icon={faXTwitter} size="lg" class="inline-block" />
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
