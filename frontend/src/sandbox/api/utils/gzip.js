import pako from 'pako';
import {Buffer} from 'buffer';

export default () => async (txtData) => {
    const compressedTxtResult = await pako.gzip(txtData);
    return Buffer.from(compressedTxtResult, 'binary').toString('base64');
};


