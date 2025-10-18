import Canvas from "@napi-rs/canvas";
import path from 'path';

export default function initializeGlobalFonts(){
    const fontPath = path.join(process.cwd(), "public", "fonts", "Inter-Black.ttf")
    Canvas.GlobalFonts.registerFromPath(fontPath, "Inter-Black")
}