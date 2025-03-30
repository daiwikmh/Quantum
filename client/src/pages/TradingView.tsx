import React, { useEffect, useRef, useState, memo } from "react";

// Proper type definition for the TradingView widget
interface TradingViewChartObject {
    remove: () => void;
    options: Record<string, any>;
    iframe?: HTMLIFrameElement;
}

// Declare the TradingView global type
declare global {
    interface Window {
        TradingView: {
            widget: new (config: TradingViewWidgetConfig) => TradingViewChartObject;
        };
    }
}

// Comprehensive widget configuration interface
interface TradingViewWidgetConfig {
    container_id: string;
    autosize: boolean;
    symbol: string;
    interval: string;
    timezone: string;
    style: string;
    locale: string;
    toolbar_bg: string;
    enable_publishing: boolean;
    allow_symbol_change: boolean;
    theme?: "light" | "dark";
    studies?: string[];
    hide_side_toolbar?: boolean;
    details?: boolean;
    hotlist?: boolean;
    calendar?: boolean;
    withdateranges?: boolean;
    hide_volume?: boolean;
    save_image?: boolean;
    show_popup_button?: boolean;
    popup_width?: string;
    popup_height?: string;
}

interface TradingViewWidgetProps {
    symbol: string;
    resolution: string;
    theme?: "light" | "dark";
    widgetClass?: string;
    studies?: string[];
    showDetails?: boolean;
    allowSymbolChange?: boolean;
}

// Helper function moved outside component for reusability
function getCurrentTimezoneName(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
        console.error("Error getting timezone:", error);
        return "Etc/UTC"; // Fallback to UTC
    }
}

// Create a singleton promise for script loading to prevent multiple loads
let tvScriptLoadingPromise: Promise<void> | null = null;

const loadTradingViewScript = (): Promise<void> => {
    if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve, reject) => {
            // Check if script is already loaded
            if (document.getElementById("tradingview-widget-loading-script")) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.id = "tradingview-widget-loading-script";
            script.src = "https://s3.tradingview.com/tv.js";
            script.type = "text/javascript";
            script.async = true;

            script.onload = () => resolve();
            script.onerror = (error) => reject(new Error(`Failed to load TradingView script: ${error}`));

            document.head.appendChild(script);
        });
    }

    return tvScriptLoadingPromise;
};

const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({
    symbol,
    resolution,
    theme = "light",
    widgetClass = "w-full h-full",
    studies = [],
    showDetails = false,
    allowSymbolChange = true,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<TradingViewChartObject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Create a unique container ID based on the symbol to avoid conflicts
        const containerId = `tradingview-widget-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;

        if (containerRef.current) {
            containerRef.current.id = containerId;
        }

        const createWidget = () => {
            if (!containerRef.current || !window.TradingView) {
                return;
            }

            // Cleanup previous widget instance
            if (widgetRef.current) {
                try {
                    widgetRef.current.remove();
                } catch (e) {
                    console.error("Error removing previous widget:", e);
                }
                widgetRef.current = null;
            }

            try {
                const widgetOptions: TradingViewWidgetConfig = {
                    container_id: containerId,
                    autosize: true,
                    symbol: symbol.startsWith("PYTH:") ? symbol : `PYTH:${symbol}`,
                    interval: resolution,
                    timezone: getCurrentTimezoneName(),
                    style: "1",
                    locale: "en",
                    toolbar_bg: "#f1f3f6",
                    enable_publishing: false,
                    allow_symbol_change: allowSymbolChange,
                    theme: theme,
                    studies: studies,
                    details: showDetails,
                    hide_side_toolbar: false,
                    withdateranges: true,
                    save_image: true,
                };

                widgetRef.current = new window.TradingView.widget(widgetOptions);
                setIsLoading(false);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error("TradingView widget initialization error:", errorMessage);
                setError(`Failed to initialize chart: ${errorMessage}`);
                setIsLoading(false);
            }
        };

        const initializeWidget = async () => {
            setIsLoading(true);
            try {
                await loadTradingViewScript();
                createWidget();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error("Error loading TradingView:", errorMessage);
                setError(`Failed to load TradingView: ${errorMessage}`);
                setIsLoading(false);
            }
        };

        initializeWidget();

        // Cleanup function
        return () => {
            if (widgetRef.current) {
                try {
                    widgetRef.current.remove();
                } catch (e) {
                    console.error("Error during cleanup:", e);
                }
                widgetRef.current = null;
            }
        };
    }, [symbol, resolution, theme, studies, showDetails, allowSymbolChange]);

    // Handle window resize to properly resize the widget
    useEffect(() => {
        const handleResize = () => {
            if (widgetRef.current?.iframe) {
                const iframe = widgetRef.current.iframe;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={widgetClass} style={{ position: 'relative' }}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                    <div className="text-blue-500">Loading chart...</div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50">
                    <div className="text-red-500 p-4 rounded-md">{error}</div>
                </div>
            )}

            <div
                ref={containerRef}
                className="w-full h-full"
            />
        </div>
    );
});

TradingViewWidget.displayName = "TradingViewWidget";

export default TradingViewWidget;