# Neuroflow AI Workflow Builder

AI Workflow Builder is a Next.js 14 web application that enables users to create and manage AI workflows seamlessly. It integrates Ollama and Stable Diffusion Forge image, allowing users to define sequential AI tasks like text generation and image creation.

## Features

### Workflow Management

- **Create Workflows:** Users can define and structure AI workflows with selected models and prompts.
- **Save Workflows:** Workflows can be saved with the selected model and prompt for later use.
- **Rename & Delete Workflows:** Users can rename existing workflows and delete ones they no longer need.

### AI Model Integration

- **Ollama Support:** Users can provide a custom model and baseUrl for Ollama.
- **Instruction Input Field:** An additional input field allows for customized instructions when making requests to Ollama.
- **Multi-Step Processing:** Define sequential AI operations such as generating a text prompt, creating an image, and upscaling it.

### Output Management

- **Save & Delete Outputs:** Users can store generated outputs and remove unwanted results.
- **Streamed Image Generation Text:** The app displays real-time streaming text updates while an image is being generated.

### Node-Based Workflow System

- **Multiple Nodes with Images:** Users can create workflows with multiple interconnected nodes that support both text and image-based tasks.
- **Flexible Workflow Execution:** Users can execute workflows in a step-by-step or automated fashion.

### User Experience Enhancements

- **Redux for State Management:** Ensures smooth and efficient handling of application state.
- **Responsive UI:** Built with Tailwind for a user-friendly experience across devices.
- **Dark/Light Mode Support:** Users can switch between themes for better usability.

## Tech Stack

- **Next.js 14 (App Router)**
- **TypeScript**
- **Redux for state management**
- **Axios for API calls**
- **TailwindCSS for UI styling**
- **Ollama for AI model integration**
- **Stable Diffusion for AI Image Generation**

## Prerequisites

Before running the project, ensure you have the following installed:

### 1. Install Ollama

Ollama allows you to run, create, and modify large language models (LLMs) locally.

1. Download Ollama from [here](https://ollama.com/download).
2. Open the installer and follow the on-screen instructions.

### 2. Install Stable Diffusion and Enable API

Stable Diffusion is a powerful text-to-image AI model.

- **Windows:**

  1. Download and install Stable Diffusion WebUI from [here](https://stable-diffusion-art.com/install-windows/).
  2. Extract the files and run `webui-user.bat`.
  3. Enable the API by adding `--api` in the `webui-user.bat` file ([like this](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API)):
     ```bash
     set COMMANDLINE_ARGS=--api
     ```
  4. Restart `webui-user.bat`. The API will be available at `http://127.0.0.1:7860`.

- **macOS & Linux:**
  1. Open the terminal and clone the Stable Diffusion WebUI repository:
     ```bash
     git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
     ```
  2. Navigate to the folder:
     ```bash
     cd stable-diffusion-webui
     ```
  3. Install dependencies (Debian-based systems):
     ```bash
     sudo apt update
     sudo apt install python3 python3-venv python3-pip
     ```
  4. Run the WebUI with API enabled:
     ```bash
     ./webui.sh --api
     ```
  5. The API will be available at `http://127.0.0.1:7860`.

For more details, refer to the [Stable Diffusion API documentation](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API).

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
