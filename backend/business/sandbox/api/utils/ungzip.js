import nodeUngzip from 'node-gzip';

export default (sandbox) => async (compressedTxtData) => {
  const decompressedTxtResult = await nodeUngzip.ungzip(
    Buffer.from(compressedTxtData, 'base64')
  );
  return decompressedTxtResult.toString();
};
