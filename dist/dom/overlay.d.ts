export interface OverlayRect {
    key: string;
    left: number;
    top: number;
    width: number;
    height: number;
}
export interface OverlayClipRect {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
export interface SpreadsheetOverlayTheme {
    selectionFill: string;
    selectionStroke: string;
    copiedOutline: string;
    copiedOutlineWidth: number;
    zIndex: number;
}
export declare const DEFAULT_OVERLAY_THEME: SpreadsheetOverlayTheme;
export declare class SelectionOverlay {
    private root;
    private fillLayer;
    private ringLayer;
    private theme;
    /**
     * Creates the overlay root and its rendering layers.
     */
    constructor(theme?: Partial<SpreadsheetOverlayTheme>);
    /**
     * Renders committed selections, copied outlines, and an optional drag preview.
     */
    render(selectionRects: OverlayRect[], copiedRects: OverlayRect[], dragRect: OverlayRect | null): void;
    /**
     * Removes the overlay from the document.
     */
    destroy(): void;
}
//# sourceMappingURL=overlay.d.ts.map