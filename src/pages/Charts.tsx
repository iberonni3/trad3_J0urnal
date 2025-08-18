// src/pages/Charts.tsx
import React, { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// adjust this import path if your TradingViewWidget.jsx is elsewhere
import TradingViewWidget from "../components/TradingViewWidget";
import "./Charts.css";

type Trade = {
  id?: string | number;
  symbol: string;        // e.g., EURUSD, XAUUSD
  direction: "long" | "short";
  entry: number;
  exit?: number | null;
  timestamp: string;     // ISO string (entry time)
  closeTime?: string | null; // ISO string (exit time)
  quantity?: number;
  notes?: string;
};

export default function Charts(): JSX.Element | null {
  const { state } = useLocation();
  const navigate = useNavigate();
  const trade = (state as any)?.trade as Trade | undefined;

  const widgetRef = useRef<any>(null);      // will hold the TradingView widget ref if available
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!trade) {
      // no trade passed -> go back to trades list
      navigate("/trades", { replace: true });
    }
  }, [trade, navigate]);

  if (!trade) return null;

  // Build TradingView symbol. Heuristic: 6-letter uppercase => FX:
  const makeTvSymbol = (s: string) => {
    if (!s) return s;
    const norm = s.replace("/", "").toUpperCase();
    if (/^[A-Z]{6}$/.test(norm)) return `FX:${norm}`;
    return norm;
  };
  const tvSymbol = makeTvSymbol(trade.symbol);

  /**
   * Attempt to find underlying chart instance and functions.
   * The embed widget doesn't standardize internal API exposure; we try a few heuristics.
   */
  const getChartInstance = useCallback(() => {
    const w = widgetRef.current as any;
    if (!w) return null;
    // different widget builds expose internals differently — try common ones
    if (w.chart) return w.chart;
    if (w.widget && w.widget.chart) return w.widget.chart;
    if (w._chart) return w._chart;
    if (typeof (w as any).activeChart === "function") return (w as any).activeChart();
    if ((w as any).tvWidget && typeof (w as any).tvWidget.activeChart === "function") {
      try {
        return (w as any).tvWidget.activeChart();
      } catch {}
    }
    return w;
  }, []);

  /**
   * Utility: safe coordinate conversions if available.
   */
  const timeToX = (chartInst: any, timeSec: number): number | null => {
    try {
      if (!chartInst) return null;
      if (typeof chartInst.timeToCoordinate === "function") return chartInst.timeToCoordinate(timeSec);
      if (chartInst.activeChart && typeof chartInst.activeChart === "function") {
        const ac = chartInst.activeChart();
        if (ac && typeof ac.timeToCoordinate === "function") return ac.timeToCoordinate(timeSec);
      }
    } catch {}
    return null;
  };
  const priceToY = (chartInst: any, price: number): number | null => {
    try {
      if (!chartInst) return null;
      if (typeof chartInst.priceToCoordinate === "function") return chartInst.priceToCoordinate(price);
      if (chartInst.activeChart && typeof chartInst.activeChart === "function") {
        const ac = chartInst.activeChart();
        if (ac && typeof ac.priceToCoordinate === "function") return ac.priceToCoordinate(price);
      }
    } catch {}
    return null;
  };

  /**
   * Build and place overlay markers. Called whenever we detect chart instance or on resize/zoom.
   */
  const renderOverlayMarkers = useCallback(
    (chartInst: any) => {
      const container = overlayRef.current;
      if (!container) return;
      container.innerHTML = ""; // cleanup previous markers

      // convert ISO -> unix seconds (TradingView internals usually use seconds)
      const entrySec = Math.floor(new Date(trade.timestamp).getTime() / 1000);
      const exitSec = trade.closeTime ? Math.floor(new Date(trade.closeTime).getTime() / 1000) : undefined;

      // try coordinate API
      const x1 = timeToX(chartInst, entrySec);
      const y1 = priceToY(chartInst, trade.entry);

      const makeEl = (cls: string, text: string) => {
        const el = document.createElement("div");
        el.className = `tv-marker ${cls}`;
        el.innerText = text;
        return el;
      };

      if (x1 != null && y1 != null) {
        // entry marker
        const entryEl = makeEl("tv-marker-entry", `ENTRY ${trade.entry}`);
        entryEl.style.left = `${x1}px`;
        entryEl.style.top = `${y1}px`;
        container.appendChild(entryEl);

        // exit marker + line
        if (exitSec && trade.exit != null) {
          const x2 = timeToX(chartInst, exitSec);
          const y2 = priceToY(chartInst, trade.exit);
          if (x2 != null && y2 != null) {
            const exitEl = makeEl("tv-marker-exit", `EXIT ${trade.exit}`);
            exitEl.style.left = `${x2}px`;
            exitEl.style.top = `${y2}px`;
            container.appendChild(exitEl);

            // svg line connecting points
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "tv-marker-line");
            svg.setAttribute("style", `position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none;`);
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", String(x1 + 8));
            line.setAttribute("y1", String(y1 + 8));
            line.setAttribute("x2", String(x2 + 8));
            line.setAttribute("y2", String(y2 + 8));
            line.setAttribute("stroke", trade.direction === "long" ? "#10b981" : "#ef4444");
            line.setAttribute("stroke-width", "2");
            svg.appendChild(line);
            container.appendChild(svg);
          } else {
            // capped: exit couldn't be positioned precisely; show fallback text
            const fallback = makeEl("tv-marker-fallback", `Exit: ${trade.exit}`);
            container.appendChild(fallback);
          }
        }
        return;
      }

      // Fallback: no coordinate API available -> show small summary top-left
      const fallback = makeEl("tv-marker-fallback", `Entry ${trade.entry} (${trade.symbol}) — ${trade.direction}`);
      container.appendChild(fallback);
    },
    [trade]
  );

  /**
   * Try to add native TradingView position shapes if the charting library exposes them.
   * This is best-effort only and will not throw if unavailable.
   */
  const tryNativeShapes = useCallback(
    (chartInst: any) => {
      if (!chartInst) return false;
      try {
        // attempt a few known method names
        const methods = ["createPositionShape", "createPosition", "createOrder", "createShape", "createPositionTool"];
        const entryTime = Math.floor(new Date(trade.timestamp).getTime() / 1000);
        const exitTime = trade.closeTime ? Math.floor(new Date(trade.closeTime).getTime() / 1000) : undefined;
        for (const m of methods) {
          if (typeof chartInst[m] === "function") {
            chartInst[m]({
              time: entryTime,
              price: trade.entry,
              direction: trade.direction === "long" ? "long" : "short",
              text: `Entry ${trade.quantity ? "x" + trade.quantity : ""}`,
            });
            if (exitTime && trade.exit != null) {
              chartInst[m]({
                time: exitTime,
                price: trade.exit,
                direction: trade.direction === "long" ? "short" : "long",
                text: `Exit`,
              });
            }
            return true;
          }
        }
      } catch (e) {
        // ignore; best-effort
      }
      return false;
    },
    [trade]
  );

  /**
   * Called once widget ref is available. Polls a bit to get the internal chart instance and renders overlays.
   */
  useEffect(() => {
    let mounted = true;
    let resizeHandler: (() => void) | null = null;

    const tryInit = () => {
      const chartInst = getChartInstance();
      // try native shapes first (if available)
      tryNativeShapes(chartInst);
      // always render overlays (overlay might be hidden if native shapes are used)
      renderOverlayMarkers(chartInst);

      // re-render on window resize
      resizeHandler = () => {
        const inst = getChartInstance();
        renderOverlayMarkers(inst);
      };
      window.addEventListener("resize", resizeHandler);
    };

    // poll for widgetRef availability (common with embed scripts)
    let attempts = 0;
    const poll = () => {
      attempts += 1;
      const w = widgetRef.current;
      if (w || attempts > 20) {
        if (mounted) tryInit();
      } else {
        setTimeout(poll, 200);
      }
    };
    poll();

    return () => {
      mounted = false;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (overlayRef.current) overlayRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getChartInstance, renderOverlayMarkers, tryNativeShapes]);

  return (
    <div className="charts-page">
      <div className="charts-header">
        <button className="btn-back" onClick={() => navigate("/trades")}>Back</button>
        <div className="trade-summary">
          <div className="symbol">{trade.symbol}</div>
          <div className={`direction ${trade.direction}`}>{trade.direction.toUpperCase()}</div>
          <div className="prices">
            <span>Entry: {trade.entry}</span>
            <span>Exit: {trade.exit ?? "—"}</span>
            <span>Qty: {trade.quantity ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ position: "relative", height: "calc(100vh - 64px)" }}>
        {/* TradingView embed script component — this component should append the TradingView script into its container */}
        <div ref={widgetRef as any} style={{ height: "100%", width: "100%" }}>
          {/* Use your existing TradingViewWidget to inject the TradingView Advanced Chart embed */}
          <TradingViewWidget />
        </div>

        {/* Overlay for markers */}
        <div
          ref={overlayRef}
          className="tv-overlay"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Helper used inside the effect: getChartInstance again (kept outside to avoid eslint deps)
 * We intentionally don't export it.
 */
function getChartInstance() {
  // This function will be replaced at runtime in the effect via widgetRef; left here for type clarity.
  return null;
}
