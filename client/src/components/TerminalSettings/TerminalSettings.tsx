import React from "react";
import { Sun, Moon } from "lucide-react";
import "./TerminalSettings.css";

interface TerminalSettingsMenuProps {
  fontSize: number;
  theme: "dark" | "light";
  onFontSizeChange: (size: number) => void;
  onThemeChange: (theme: "dark" | "light") => void;
}

const TerminalSettingsMenu: React.FC<TerminalSettingsMenuProps> = ({
  fontSize,
  theme,
  onFontSizeChange,
  onThemeChange,
}) => {
  const toggleTheme = () => {
    onThemeChange(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="terminal-settings-menu">
      <div className="font-size-control">
        <div className="setting-group font-size-group">
  <img src="/size.png" alt="Font size icon" className="size-icon" />
  <input
    type="number"
    value={fontSize}
    onChange={(e) => onFontSizeChange(Number(e.target.value))}
    min={10}
    max={30}
    className="font-size-input"
    />
      </div>
       </div>
      <div className="theme-toggle" onClick={toggleTheme}>
        <div className={`icon-wrapper ${theme === "light" ? "rotate" : ""}`}>
          {theme === "dark" ? <Sun size={20} color="white" /> : <Moon size={20} color="white" />}
        </div>
      </div>
    </div>
  );
};

export default TerminalSettingsMenu;
