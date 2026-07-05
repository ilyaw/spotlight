import { CommandDeckPanel } from "./components/command-deck/CommandDeckPanel";
import { WindowKeyboardLayer } from "./components/WindowKeyboardLayer";

function App() {
  return (
    <div className="w-full">
      <WindowKeyboardLayer />
      <CommandDeckPanel />
    </div>
  );
}

export default App;
