import React from 'react';
import { WatermarkStyle, WatermarkPosition } from './types/watermark';
interface WatermarkProps {
    text: string;
    style: WatermarkStyle;
    position?: WatermarkPosition;
    multiple?: boolean;
    className?: string;
}
declare const Watermark: React.FC<WatermarkProps>;
export default Watermark;
