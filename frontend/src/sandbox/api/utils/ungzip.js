import pako from 'pako';
import toUint8Array from 'base64-to-uint8array';

export default () => async (compressedTxtData) => {
    const stringToUint8Array = toUint8Array(compressedTxtData);
    const decompressedTxtResult = await pako.ungzip(stringToUint8Array, {to: 'string'});
    return decompressedTxtResult;
};
