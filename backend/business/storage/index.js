import S3Provider from './providers/s3.js';
import MinioProvider from './providers/minio.js';

const PROVIDERS = {
  s3: S3Provider,
  minio: MinioProvider,
};

export default class Storage {
  constructor({ type = 'minio', bucket = 'plasticine', ...configs }) {
    this.type = type;
    this.provider = new PROVIDERS[type](configs);
    this.bucketName = bucket;
  }

  bucketExists(bucketName) {
    return this.provider.bucketExists(bucketName);
  }

  createBucket(bucketName) {
    return this.provider.createBucket(bucketName);
  }

  listObjects(prefix, recursive) {
    return this.provider.listObjects(this.bucketName, prefix, recursive);
  }

  listIncompleteUploads(prefix, recursive) {
    return this.provider.listIncompleteUploads(this.bucketName, prefix, recursive);
  }

  getObject(objectName) {
    if (!objectName) return;
    return this.provider.getObject(this.bucketName, objectName);
  }

  statObject(objectName) {
    if (!objectName) return;
    return this.provider.statObject(this.bucketName, objectName);
  }

  putObject(objectName, stream, size, contentType) {
    return this.provider.putObject(this.bucketName, objectName, stream, size, contentType);
  }

  copyObject(objectName, sourceObject) {
    return this.provider.copyObject(this.bucketName, objectName, sourceObject);
  }

  removeObject(objectName) {
    return this.provider.removeObject(this.bucketName, objectName);
  }

  removeIncompleteUpload(objectName) {
    return this.provider.removeIncompleteUpload(this.bucketName, objectName);
  }
}
