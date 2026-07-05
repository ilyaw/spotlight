import { CommandDeckPanel } from "./components/command-deck/CommandDeckPanel";

function App() {
  return (
    <div className="h-full overflow-hidden rounded-[var(--radius-deck)]">
      <CommandDeckPanel />
    </div>
  );
}

export default App;
