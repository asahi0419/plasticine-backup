import AWS from 'aws-sdk';

export default class S3Provider {
  constructor(config = {}) {
    this.config = {
      region: 'us-east-1',
      part_size: 1048576000,
    };

    if (config.ssl) this.config.sslEnabled = true;
    if (config.region) this.config.region = config.region;

    this.client = new AWS.S3(this.config);
  }

  bucketExists(bucketName) {
    return new Promise((resolve, reject) => {
      return this.client.headBucket({ Bucket: bucketName }, (err, data) => {
        return err
          ? resolve(err)
          : resolve(data);
      });
    });
  }

  createBucket(bucketName) {
    return new Promise((resolve, reject) => {
      return this.client.createBucket({ Bucket: bucketName }, (err, data) => {
        return err
          ? resolve(err)
          : resolve(data);
      });
    });
  }

  listObjects(bucketName) {
    return new Promise((resolve, reject) => {
      return this.client.listObjects({ Bucket: bucketName }, (err, data) => {
        return err
          ? resolve(err)
          : resolve(data);
      });
    });
  }

  listIncompleteUploads() {
    throw new Error('Not implemented');
  }

  async getObject(bucketName, objectName) {
    return this.client.getObject({ Bucket: bucketName, Key: objectName }).createReadStream();
  }

  statObject(bucketName, objectName) {
    return new Promise((resolve, reject) => {
      return this.client.headObject({ Bucket: bucketName, Key: objectName }, (err, data) => {
        return err
          ? resolve(err)
          : resolve(data);
      });
    });
  }

  putObject(bucketName, objectName, stream, size, contentType) {
    return new Promise((resolve, reject) => {
      return this.client.putObject({
        Bucket: bucketName,
        Key: objectName,
        Body: stream,
        ContentLength: size,
        ContentType: contentType,
      }, (err, data) => {
        return err
          ? resolve(err)
          : resolve(data);
      });
    });
  }

  copyObject(bucketName, objectName, sourceObject) {
    return new Promise((resolve, reject) => {
      return this.client.copyObject({
        Bucket: bucketName,
        CopySource: `/${bucketName}/${sourceObject}`,
        Key: objectName,
      }, (err, data) => {
        return err
          ? resolve(err)
          : resolve(data);
      });
    });
  }
  
  async removeObject(bucketName, objectName) {
    return new Promise((resolve, reject) => {
      return this.client.deleteObject({
        Bucket: bucketName,
        Key: objectName,
      }, (err, data) => {
        return err
          ? resolve(err)
          : resolve(data);
      });
    });
  }

  removeIncompleteUpload() {
    throw new Error('Not implemented');
  }
}
