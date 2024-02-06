import { WatermarkStyle, WatermarkPosition } from '../types/watermark';
interface CanvasToImageParams {
    text: string;
    style: WatermarkStyle;
    position?: WatermarkPosition;
    multiple?: boolean;
}
declare const canvasToImage: ({ text, style, position, multiple }: CanvasToImageParams) => string;
export default canvasToImage;
