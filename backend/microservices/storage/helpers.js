import Promise from 'bluebird';

import createStorage from '../../business/storage/factory.js';

export const initStorageBuckets = async (buckets = []) => {
  const storage = await createStorage();
  return Promise.map(buckets, (bucket) => checkBucket(bucket, storage));
};

async function checkBucket(bucketName, storage) {
  const bucketExists = await storage.bucketExists(bucketName)
  if (!bucketExists) await storage.createBucket(bucketName);
}
