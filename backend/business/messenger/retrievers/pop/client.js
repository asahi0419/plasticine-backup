import POP3Client from 'poplib';

export default class Client {
  constructor(options = {}) {
    this.options = options;
    this.events = {};
  }

  on = (event, callback) => {
    if (this.events[event]) return;

    this.events[event] = true;
    this.client.on(event, callback);
  };

  connect = async ({ port, host }) => {
    await new Promise((resolve, reject) => {
      this.client = new POP3Client(port, host, this.options);

      this.on('connect', () => {
        console.log('Connect: Success');
        resolve(true);
      });

      this.on('error', (err) => {
        console.log('Error', err);
        reject(err);
      });

      this.on('invalid-state', (cmd) => {
        console.log('Invalid state: You tried calling ' + cmd);
      });

      this.on('locked', (cmd) => {
        console.log('Locked: Current command has not finished yet. You tried calling ' + cmd);
      });
    });
  };

  quit = async () => {
    return new Promise((resolve, reject) => {
      this.on('quit', (status, rawdata) => {
        if (status) {
          console.log('Quit: Success');
          resolve({ status, rawdata });
        } else {
          console.log('Quit: Failed');
          reject({ status, rawdata });
        }
      });

      this.client.quit();
    });
  };

  login = ({ user, pass }) => {
    return new Promise((resolve, reject) => {
      this.on('login', (status, data) => {
        if (status) {
          console.log('Login: Success');
          resolve({ status, data });
        } else {
          console.log('Login: Failed');
          reject({ status, data });
        }
      });

      this.client.login(user, pass);
    });
  };

  stat = async (...args) => {
    return new Promise((resolve, reject) => {
      this.on('stat', (status, data, rawdata) => {
        if (status) {
          console.log('STAT: Success');
          resolve({ status, data, rawdata });
        } else {
          console.log('STAT: Failed');
          reject({ status, data, rawdata });
        }
      });

      this.client.stat(...args);
    });
  };

  list = async (...args) => {
    return new Promise((resolve, reject) => {
      this.on('list', (status, msgcount, msgnumber, data, rawdata) => {
        if (status) {
          console.log('List: Success with ' + msgcount + ' message(s)');
          resolve({ status, msgcount, msgnumber, data, rawdata });
        } else {
          console.log('List: Failed');
          reject({ status, msgcount, msgnumber, data, rawdata });
        }
      });

      this.client.list(...args);
    });
  };

  retr = async (...args) => {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.on('retr', (status, msgnumber, data, rawdata) => {
        if (status) {
          console.log('Retr: Success for msgnumber ' + msgnumber);
          this.resolve({ status, msgnumber, data, rawdata });
        } else {
          console.log('Retr: Failed for msgnumber ' + msgnumber);
          this.reject({ status, msgnumber, data, rawdata });
        }
      });

      this.client.retr(...args);
    });
  };

  dele = async (...args) => {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.on('dele', (status, msgnumber, data, rawdata) => {
        if (status) {
          console.log('Dele: Success for msgnumber ' + msgnumber);
          this.resolve({ status, msgnumber, data, rawdata });
        } else {
          console.log('Dele: Failed for msgnumber ' + msgnumber);
          this.reject({ status, msgnumber, data, rawdata });
        }
      });

      this.client.dele(...args);
    });
  };
}
