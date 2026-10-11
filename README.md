# Tinder AI Frontend

A React interface for browsing generated profiles, creating matches, and chatting through a companion backend.

## Features

- Browse profiles and accept or skip them.
- View matches and open conversations.
- Send chat messages and refresh conversation history.
- Display typing animation and focus on new messages.

## Requirements

- Node.js `^20.19.0 || >=22.12.0` and npm.
- A running backend exposing profiles, matches, conversations, and images.

## Run locally

```sh
git clone https://github.com/PravatKumaraMishra/TinderAiFrontend.git
cd TinderAiFrontend
npm ci
```

Copy `.env.example` to `.env.local`:

```dotenv
VITE_BACKEND_URL=http://localhost:8080
```

Start [TinderAiBackend](https://github.com/PravatKumaraMishra/TinderAiBackend) separately, then run this frontend. Use the profile controls, switch to matches, and open a chat.

```sh
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Available commands

| Command | Script |
| --- | --- |
| `npm run dev` | `vite` |
| `npm run build` | `vite build` |
| `npm run lint` | `oxlint` |
| `npm run preview` | `vite preview` |

`npm run preview` serves the output of `npm run build`; it does not build the project itself.

## Project structure

- `src/App.jsx`: screen navigation and state.
- `src/ProfileSelector.jsx`, `src/MatchList.jsx`, `src/ChatScreen.jsx`: screens.
- `src/fetch*.js`, `src/saveSwipe.js`, `src/sendMessage.js`: API helpers.

## Notes

The UI needs the backend to return profiles and conversations. Check backend availability, its image route, and CORS if the screen remains on Loading. Backend AI configuration is documented in its repository. This is a learning application.
