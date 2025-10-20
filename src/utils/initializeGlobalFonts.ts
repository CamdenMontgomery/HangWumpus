
import Canvas from "@napi-rs/canvas";
import path from 'path';


/**
 * Register the "Inter-Black" font with @napi-rs/canvas for global use.
 *
 * Resolves the font file at "<project-root>/public/fonts/Inter-Black.ttf" (using process.cwd())
 * and registers it via Canvas.GlobalFonts.registerFromPath under the family name "Inter-Black".
 *
 * This function has a global side effect and should be called once during application startup
 * before rendering any text to canvases that rely on the registered font.
 *
 * @remarks
 * - Relies on the current working directory (process.cwd()) to locate the font file.
 * - Delegates to @napi-rs/canvas for font registration.
 *
 * @throws {Error} If the font file cannot be found or registration fails.
 *
 * @example
 * // Call once at app initialization
 * initializeGlobalFonts();
 *
 * @returns void
 */
export default function initializeGlobalFonts(){
    const fontPath = path.join(process.cwd(), "public", "fonts", "Inter-Black.ttf")
    Canvas.GlobalFonts.registerFromPath(fontPath, "Inter-Black")
}