interface SecurityDefenseProps {
    watermarkWrapperId: string;
    watermarkId: string;
}
export default class SecurityDefense {
    private watermarkWrapperId;
    private watermarkId;
    constructor({ watermarkWrapperId, watermarkId }: SecurityDefenseProps);
    getWatermarkWrapperObserver(): MutationObserver;
    getWatermarkObserver(): MutationObserver;
}
export {};
