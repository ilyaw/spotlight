import { forwardRef } from "react";
import { Search } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { RgbBorderWrapper } from "./RgbBorderWrapper";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onChange, onKeyDown }, ref) {
    const handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
      if (event.button !== 0) return;
      void getCurrentWindow().startDragging();
    };

    return (
      <RgbBorderWrapper
        variant="search-row"
        fallbackClassName="border-b border-white/10"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={2} />
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onMouseDown={handleMouseDown}
            placeholder="Search apps and commands…"
            className="w-full bg-transparent text-lg text-zinc-100 placeholder:text-zinc-500 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </RgbBorderWrapper>
    );
  },
);
