# Neuroflow AI Workflow Builder

AI Workflow Builder is a Next.js 14 web application that enables users to create and manage AI workflows seamlessly. It integrates Ollama and Stable Diffusion Forge image, allowing users to define sequential AI tasks like text generation and image creation.

# Features

## Workflow Management

- **Create Workflows:** Users can define and structure AI workflows with selected models and prompts.
- **Save Workflows:** Workflows can be saved with the selected model and prompt for later use.
- **Rename & Delete Workflows:** Users can rename existing workflows and delete ones they no longer need.

## AI Model Integration

- **Ollama Support:** Users can provide a custom model and baseUrl for Ollama.
- **Instruction Input Field:** An additional input field allows for customized instructions when making requests to Ollama.
- **Multi-Step Processing:** Define sequential AI operations such as generating a text prompt, creating an image, and upscaling it.

## Output Management

- **Save & Delete Outputs:** Users can store generated outputs and remove unwanted results.
- **Streamed Image Generation Text:** The app displays real-time streaming text updates while an image is being generated.

## Node-Based Workflow System

- **Multiple Nodes with Images:** Users can create workflows with multiple interconnected nodes that support both text and image-based tasks.
- **Flexible Workflow Execution:** Users can execute workflows in a step-by-step or automated fashion.

## User Experience Enhancements

- **Redux for State Management:** Ensures smooth and efficient handling of application state.
- **Responsive UI:** Built with Tailwind for a user-friendly experience across devices.
- **Dark/Light Mode Support:** Users can switch between themes for better usability.

## Tech Stack

Next.js 14 (App Router)

TypeScript

Redux for state management

Axios for API calls

TailwindCSS for UI styling

Ollama for AI model integration

Stable Diffusion for AI Image Generation

## Screenshots

[Neuroflow Screenshot](https://drive.google.com/drive/u/1/folders/1Cn_iqV03M9nF-nIkzbfbS2gTXrUettC1)

[Neuroflow Video](https://drive.google.com/file/d/1lDFiDnXuNlM1oeXWh2Twyy5E2IObj-eZ/view)

## Run Locally

Clone the project

change .env.sample to .env and use mongodb uri

```bash
  git clone https://github.com/Lohit-Behera/neuroflow.git
```

Go to the project directory

```bash
  cd neuroflow
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## Contributing

Contributions are welcome! Feel free to submit a pull request or report issues.

## License

[MIT](https://choosealicense.com/licenses/mit/)
