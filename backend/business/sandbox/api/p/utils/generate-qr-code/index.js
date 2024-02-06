import QRCode from 'qrcode';

export default (sandbox) => async (strInput = 'test', strErrorCorrectionLevel = 'M') => {
  const bufferData =  await QRCode.toBuffer(strInput, { errorCorrectionLevel: `${strErrorCorrectionLevel}` });
  return bufferData;
};