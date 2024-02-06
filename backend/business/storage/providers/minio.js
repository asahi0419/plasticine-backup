import Promise from 'bluebird';
import { Client, CopyConditions } from 'minio';

export default class MinioProvider {
  constructor(config = {}) {
    const params = {
      endPoint: config.host || 'storage',
      useSSL: config.ssl || false,
      region: config.region || 'us-east-1',
    };

    if (config.port) params.port = +config.port;
    if (config.access_key) params.accessKey = config.access_key;
    if (config.secret_key) params.secretKey = config.secret_key;
    if (config.session_token) params.sessionToken = config.session_token;
    if (config.part_size) params.partSize = +config.part_size;
    if (config.path_style) params.pathStyle = true;

    this.client = new Client(params);
  }

  bucketExists(bucketName) {
    return new Promise((resolve, reject) => {
      return this.client.bucketExists(bucketName, (err, exists) => {
        return err
          ? resolve(err)
          : resolve(exists);
      });
    });
  }

  createBucket(bucketName) {
    return new Promise((resolve, reject) => {
      return this.client.makeBucket(bucketName, this.client.region, (err) => {
        return err
          ? reject(err)
          : resolve()
      });
    });
  }

  listObjects(bucketName, prefix, recursive) {
    return Promise.resolve(this.client.listObjects(bucketName, prefix, recursive));
  }

  listIncompleteUploads(bucketName, prefix, recursive) {
    return Promise.resolve(this.client.listIncompleteUploads(bucketName, prefix, recursive));
  }

  getObject(bucketName, objectName) {
    return new Promise((resolve, reject) => {
      return this.client.getObject(bucketName, objectName, (err, stream) => {
        return err
          ? reject(err)
          : resolve(stream);
      });
    });
  }

  statObject(bucketName, objectName) {
    return new Promise((resolve, reject) => {
      return this.client.statObject(bucketName, objectName, (err, stat) => {
        return err
          ? reject(err)
          : resolve(stat);
      });
    });
  }

  putObject(bucketName, objectName, stream, size) {
    return new Promise((resolve, reject) => {
      return this.client.putObject(bucketName, objectName, stream, size, (err, etag) => {
        return err
          ? reject(err)
          : resolve(etag);
      });
    });
  }

  copyObject(bucketName, objectName, sourceObject) {
    return new Promise((resolve, reject) => {
      return this.client.copyObject(bucketName, objectName, `/${bucketName}/${sourceObject}`, new CopyConditions(), (err, etag) => {
        return err
          ? reject(err)
          : resolve(etag);
      });
    });
  }

  removeObject(bucketName, objectName) {
    return new Promise((resolve, reject) => {
      return this.client.removeObject(bucketName, objectName, (err) => {
        return err
          ? reject(err)
          : resolve();
      });
    });
  }

  removeIncompleteUpload(bucketName, objectName) {
    return new Promise((resolve, reject) => {
      return this.client.removeIncompleteUpload(bucketName, objectName, (err) => {
        return err
          ? reject(err)
          : resolve();
      });
    });
  }
}
