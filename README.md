# OpenCV ImageLab on Web

[![Powered By Sveltekit](https://img.shields.io/badge/powered%20by-svelte-FF3C02.svg?style=flat&logo=svelte)](https://kit.svelte.dev/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/d273c856-5c6d-4602-a545-ed3ef4778b9d/deploy-status)](https://app.netlify.com/sites/cv-imagelab/deploys)

It is a lightweight application that enables web clients to develop image processing tasks using OpenCV in Python.
It leverages Pyodide as the runtime environment, and with built-in image preview functionality, it's easily do with just a web browser.

## Key Features:

- Develop image processing tasks using OpenCV in Python.
- Utilizes Pyodide for a self-contained Python environment within the web browser.
- Built-in image preview for immediate feedback.

With OpenCV ImageLab on Web, image processing becomes accessible to everyone with a web browser, making it simple and convenient to experiment with OpenCV's powerful capabilities.

## Public demo

You can try the actual demo [here](https://cv-imagelab.netlify.app/).

## Developing

To run the application locally, follow these steps:

1. Clone the repository.

```bash
git clone https://github.com/sabamotto/opencv-imagelab-web.git
```

2. Navigate to the project folder.

```bash
cd opencv-imagelab-web
```

3. Install dependencies. Please install [pnpm](https://pnpm.io/) in advance.

```bash
pnpm ci
```

4. Start the application.

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

The application will run by default at `http://localhost:5173/`.

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `npm run preview`.

## Contributing

Contributions to this project are welcome. Whether it's bug reports, feature suggestions, or code improvements, feel free to contribute in any way you can.

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

## Contact

If you have any questions or suggestions, please don't hesitate to contact us at:

- GitHub: [@sabamotto](https://github.com/sabamotto)
- Twitter: [@sabamotto](https://twitter.com/sabamotto)
