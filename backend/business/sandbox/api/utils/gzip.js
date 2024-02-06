import nodeGzip from 'node-gzip';

export default (sandbox) => async (txtData) => {
  const compressedTxtResult = await nodeGzip.gzip(txtData);
  return compressedTxtResult.toString('base64');
};
