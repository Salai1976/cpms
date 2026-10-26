# CampusHire AI Placement Assistant (Local Ollama)

This version adds a floating AI placement chatbot and runs the language model locally through Ollama. **No Gemini/OpenAI API key or paid AI API is needed.** Your chat requests are sent to Ollama on your own computer. Internet is needed to download Ollama and the model the first time; after that, AI replies can work offline.

## What was added

- Floating ✦ chat button and chat panel in the existing frontend.
- Additive `POST /api/assistant/chat` backend endpoint.
- Local model integration through Ollama; existing CampusHire pages and API routes are retained.

## One-time setup (Windows)

1. **Install Ollama:** download and install it from <https://ollama.com/download/windows>.
2. Open **Command Prompt** or **PowerShell** and download a model:
   ```bash
   ollama pull qwen2.5:3b
   ```
   The model download may take a few minutes and several GB of disk space. If your computer has limited RAM, you can use a smaller model such as `qwen2.5:1.5b`; update `OLLAMA_MODEL` in `backend/.env` to match.
3. Make sure Ollama is running. The Windows app normally runs in the background. You can test it with:
   ```bash
   ollama run qwen2.5:3b
   ```
   Type a question, then type `/bye` to exit the model chat. Keep Ollama running while you use the CampusHire assistant.
4. Open the project's `backend` folder in a terminal and install the backend dependencies:
   ```bash
   npm install
   ```
5. Copy `backend/.env.example` to `backend/.env`. Keep your existing MongoDB and email settings if you already have them. The AI settings should be:
   ```env
   OLLAMA_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=qwen2.5:3b
   ```
   There is no API key to create or paste.
6. Start the backend from that folder:
   ```bash
   npm start
   ```
7. Start/open CampusHire the same way you normally do, then click the floating ✦ button.

## If the chatbot does not reply

- **Cannot connect to Ollama:** make sure Ollama is installed and running; try `ollama list` in a terminal.
- **Model not found:** run `ollama pull qwen2.5:3b` and make sure `OLLAMA_MODEL` matches the downloaded model name.
- **Backend cannot start:** use a recent Node.js LTS release and run `npm install` inside `backend`.
- **MongoDB warning:** this project still uses the existing MongoDB backend. Keep MongoDB running and preserve your existing `MONGODB_URI` setting for the normal CampusHire features.
- **Slow responses:** local AI speed depends on your computer's RAM/CPU/GPU. Try a smaller model such as `qwen2.5:1.5b` if needed.

## Notes

- The assistant gives general placement and career guidance. It does not automatically read student records, private profile data, live job drives, or application status.
- This is a local-model integration, but installing/downloading the model requires internet initially.
- Keep `.env` private. Do not commit credentials to source control.
