// Centralized Android & Mobile Back Button / Navigation History Manager for ChessZen

import { GameTab } from "../types";

export interface BackHandler {
  id: string;
  priority: number; // Higher number = executed first
  handleBack: () => boolean; // Return true if back action was handled/consumed
}

export interface NavigationEntry {
  tab: GameTab;
  meta?: any;
}

class NavigationManager {
  private handlers: BackHandler[] = [];
  private historyStack: NavigationEntry[] = [{ tab: GameTab.DASHBOARD }];
  private currentTab: GameTab = GameTab.DASHBOARD;
  private lastBackPressTime = 0;
  private exitToastListeners: Set<(show: boolean) => void> = new Set();
  private tabChangeListeners: Set<(tab: GameTab, meta?: any) => void> = new Set();
  private initialized = false;
  private isProcessingPopState = false;

  public init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    // 1. Initial State in browser history
    try {
      if (!window.history.state || !window.history.state.chesszen) {
        window.history.replaceState({ chesszen: true, tab: GameTab.DASHBOARD, depth: 1 }, "");
      }
    } catch {
      // ignore
    }

    // 2. HTML5 PopState (triggered by Android hardware back button in browser/WebView)
    window.addEventListener("popstate", (event) => {
      this.isProcessingPopState = true;
      const handled = this.triggerBack();
      
      // If we handled the back action internally, re-push a dummy state to keep the back button functional
      if (handled) {
        try {
          window.history.pushState({ chesszen: true, tab: this.currentTab, depth: this.historyStack.length + 1 }, "");
        } catch {
          // ignore
        }
      }
      this.isProcessingPopState = false;
    });

    // 3. Cordova / PhoneGap / Capacitor document backbutton event
    document.addEventListener("backbutton", (event: any) => {
      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      this.triggerBack();
    }, false);

    // 4. Capacitor App Plugin Native Back Button
    try {
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.App?.addListener) {
        cap.Plugins.App.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
          this.triggerBack();
        });
      }
    } catch (e) {
      console.warn("Capacitor backButton listener init notice:", e);
    }

    // 5. Hardware Keyboard Escape / Back Key
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const handled = this.triggerBack();
        if (handled) {
          event.preventDefault();
        }
      }
    });
  }

  /**
   * Register a component-level or modal-level back interceptor.
   * Handlers with higher priority numbers are executed first.
   */
  public registerHandler(handler: BackHandler): () => void {
    // Remove any existing handler with same ID
    this.handlers = this.handlers.filter((h) => h.id !== handler.id);
    this.handlers.push(handler);
    // Sort descending by priority
    this.handlers.sort((a, b) => b.priority - a.priority);

    return () => {
      this.unregisterHandler(handler.id);
    };
  }

  public unregisterHandler(id: string) {
    this.handlers = this.handlers.filter((h) => h.id !== id);
  }

  /**
   * Record navigation to a tab in the internal history stack.
   */
  public pushTab(tab: GameTab, meta?: any) {
    this.currentTab = tab;
    const last = this.historyStack[this.historyStack.length - 1];

    // Avoid immediate duplicate entries
    if (!last || last.tab !== tab) {
      this.historyStack.push({ tab, meta });
      // Keep stack reasonable length (max 30)
      if (this.historyStack.length > 30) {
        this.historyStack.shift();
      }

      // Sync browser history state if not in popstate
      if (!this.isProcessingPopState && typeof window !== "undefined") {
        try {
          window.history.pushState({ chesszen: true, tab, depth: this.historyStack.length }, "");
        } catch {
          // ignore
        }
      }
    }
  }

  /**
   * Reset navigation history (e.g. on fresh login or logout)
   */
  public resetHistory(initialTab: GameTab = GameTab.DASHBOARD) {
    this.currentTab = initialTab;
    this.historyStack = [{ tab: initialTab }];
  }

  public getCurrentTab(): GameTab {
    return this.currentTab;
  }

  public getHistoryLength(): number {
    return this.historyStack.length;
  }

  /**
   * Primary Back Button Resolution Engine.
   * Priority:
   * 1. Top registered modal/drawer/subview handlers (priority >= 50)
   * 2. Internal Tab History Stack pop -> Previous Screen
   * 3. If at root Dashboard: Double-Back-to-Exit
   */
  public triggerBack(): boolean {
    // 1. Iterate through registered handlers (modals, dialogs, drawers, subviews)
    for (const handler of this.handlers) {
      try {
        const handled = handler.handleBack();
        if (handled) {
          return true;
        }
      } catch (err) {
        console.warn(`Error in back handler ${handler.id}:`, err);
      }
    }

    // 2. If no modal/subview handled it, navigate backward in internal tab history
    if (this.historyStack.length > 1) {
      // Pop current screen
      this.historyStack.pop();
      const previous = this.historyStack[this.historyStack.length - 1];
      if (previous) {
        this.currentTab = previous.tab;
        this.notifyTabChange(previous.tab, previous.meta);
        return true;
      }
    }

    // 3. If currently on a non-dashboard screen but history stack was 1, return to Dashboard
    if (this.currentTab !== GameTab.DASHBOARD) {
      this.currentTab = GameTab.DASHBOARD;
      this.historyStack = [{ tab: GameTab.DASHBOARD }];
      this.notifyTabChange(GameTab.DASHBOARD);
      return true;
    }

    // 4. Root Screen (Dashboard) Double-Back-To-Exit Behavior
    const now = Date.now();
    if (now - this.lastBackPressTime < 2500) {
      // Second back press within 2.5s -> Exit application
      this.notifyExitToast(false);
      this.performAppExit();
      return false;
    } else {
      // First back press -> Show "Press back again to exit ChessZen" toast
      this.lastBackPressTime = now;
      this.notifyExitToast(true);
      setTimeout(() => {
        // Hide after 2.5s if second press didn't happen
        if (Date.now() - this.lastBackPressTime >= 2400) {
          this.notifyExitToast(false);
        }
      }, 2500);
      return true; // We handled the first press by showing warning
    }
  }

  private performAppExit() {
    try {
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.App?.exitApp) {
        cap.Plugins.App.exitApp();
        return;
      }
      if ((navigator as any).app?.exitApp) {
        (navigator as any).app.exitApp();
        return;
      }
    } catch {
      // ignore
    }
  }

  // Listener subscriptions
  public onExitToast(callback: (show: boolean) => void): () => void {
    this.exitToastListeners.add(callback);
    return () => {
      this.exitToastListeners.delete(callback);
    };
  }

  public onTabChange(callback: (tab: GameTab, meta?: any) => void): () => void {
    this.tabChangeListeners.add(callback);
    return () => {
      this.tabChangeListeners.delete(callback);
    };
  }

  private notifyExitToast(show: boolean) {
    this.exitToastListeners.forEach((listener) => {
      try {
        listener(show);
      } catch {
        // ignore
      }
    });
  }

  private notifyTabChange(tab: GameTab, meta?: any) {
    this.tabChangeListeners.forEach((listener) => {
      try {
        listener(tab, meta);
      } catch {
        // ignore
      }
    });
  }
}

export const navigationManager = new NavigationManager();
