/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef } from "react";

type Shortcuts = Record<string, () => void>;

const GlobalKeyboardContext = createContext<
    [(key: keyof Shortcuts, callback: () => void) => void, (key: keyof Shortcuts) => void]
>([
    () => {
        /* */
    },
    () => {
        /* */
    },
]);

export const useGlobalKeyboard = () => {
    return useContext(GlobalKeyboardContext);
};

export const GlobalKeyboardProvider = ({ children }: { children: React.ReactNode }) => {
    const shortcuts = useRef<Shortcuts>({});

    const registerShortcut = useCallback((key: keyof Shortcuts, callback: () => void) => {
        shortcuts.current[key] = callback;
    }, []);

    const unregisterShortcut = useCallback((key: keyof Shortcuts) => {
        delete shortcuts.current[key];
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement | null;
            const focusedTag = active?.tagName ?? "";
            const isTextField =
                focusedTag === "INPUT" ||
                focusedTag === "TEXTAREA" ||
                active?.getAttribute("contenteditable") === "true";

            if (document.body.dataset["scrollLocked"] === "1") return;
            if (isTextField) return; // Allow native behavior

            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.repeat) return;

            switch (e.code) {
                case "KeyA": {
                    e.preventDefault();
                    if (e.shiftKey) shortcuts.current["Shift+A"]?.();
                    else shortcuts.current["A"]?.();
                    
                    break;
                }
                case "ArrowLeft": {
                    if (e.shiftKey) return;
                    
                    e.preventDefault();
                    shortcuts.current["ArrowLeft"]?.();

                    break;
                }
                case "ArrowRight": {
                    if (e.shiftKey) return;
                    
                    e.preventDefault();
                    shortcuts.current["ArrowRight"]?.();

                    break;
                }
                case "ArrowUp": {
                    if (e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["ArrowUp"]?.();
                    break;
                }
                case "ArrowDown": {
                    if (e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["ArrowDown"]?.();
                    break;
                }
                case "Delete": {
                    e.preventDefault();
                    if (e.shiftKey) shortcuts.current["Shift+Delete"]?.();
                    else shortcuts.current["Delete"]?.();
                    
                    break;
                }
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <GlobalKeyboardContext.Provider value={[registerShortcut, unregisterShortcut]}>
            {children}
        </GlobalKeyboardContext.Provider>
    );
};
