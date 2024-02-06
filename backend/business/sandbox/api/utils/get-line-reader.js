import fs from 'fs';
import { StringDecoder } from 'string_decoder';
import { isFunction, isString, isRegExp } from 'lodash-es';

import { NoPermissionsError } from '../../../error/index.js';

const checkPermission = (sandbox) => {
  if (sandbox.vm.p.currentUser.isBelongsToWorkgroupByAlias('__core')) return;

  throw new NoPermissionsError('You have no access to the filesystem');
}

export default (sandbox) => ({
  open: open(sandbox),
  eachLine: eachLine(sandbox),
});

function createLineReader(readStream, options, creationCb) {
  if (isFunction(options)) {
    creationCb = options;
    options = undefined;
  }
  if (!options) options = {};

  var encoding = options.encoding || 'utf8',
      separator = options.separator || /\r\n?|\n/,
      bufferSize = options.bufferSize || 1024,
      bufferStr = '',
      decoder = new StringDecoder(encoding),
      closed = false,
      eof = false,
      separatorIndex = -1,
      separatorLen,
      readDefer,
      moreToRead = false,
      findSeparator;

  if (isRegExp(separator)) {
    findSeparator = function() {
      var result = separator.exec(bufferStr);
      if (result && (result.index + result[0].length < bufferStr.length || eof)) {
        separatorIndex = result.index;
        separatorLen = result[0].length;
      } else {
        separatorIndex = -1;
        separatorLen = 0;
      }
    };
  } else {
    separatorLen = separator.length;
    findSeparator = function() {
      separatorIndex = bufferStr.indexOf(separator);
    };
  }

  function getReadStream() {
    return readStream;
  }

  function close(cb) {
    if (!closed) {
      closed = true;
      if (typeof readStream.close == 'function') {
        readStream.close();
      }
      setImmediate(cb);
    }
  }

  function onFailure(err) {
    close(function(err2) {
      return creationCb(err || err2);
    });
  }

  function isOpen() {
    return !closed;
  }

  function isClosed() {
    return closed;
  }

  function waitForMoreToRead(cb) {
    if (moreToRead) {
      cb();
    } else {
      readDefer = cb;
    }
  }

  function resumeDeferredRead() {
    if (readDefer) {
      readDefer();
      readDefer = null;
    }
  }

  function read(cb) {
    waitForMoreToRead(function() {
      var chunk;

      try {
        chunk = readStream.read(bufferSize);
      } catch (err) {
        cb(err);
      }

      if (chunk) {
        bufferStr += decoder.write(chunk.slice(0, chunk.length));
      } else {
        moreToRead = false;
      }

      cb();
    });
  }

  function onStreamReadable() {
    moreToRead = true;
    resumeDeferredRead();
  }

  function onStreamEnd() {
    eof = true;
    resumeDeferredRead();
  }

  readStream.on('readable', onStreamReadable);
  readStream.on('end', onStreamEnd);
  readStream.on('error', onFailure);

  function shouldReadMore() {
    findSeparator();

    return separatorIndex < 0 && !eof;
  }

  function callWhile(conditionFn, bodyFn, doneCallback) {
    if (conditionFn()) {
      bodyFn(function (err) {
        if (err) {
          doneCallback(err);
        } else {
          setImmediate(callWhile, conditionFn, bodyFn, doneCallback);
        }
      });
    } else {
      doneCallback();
    }
  }

  function readToSeparator(cb) {
    callWhile(shouldReadMore, read, cb);
  }

  function hasNextLine() {
    return bufferStr.length > 0 || !eof;
  }

  function nextLine(cb) {
    if (closed) {
      return cb(new Error('LineReader has been closed'));
    }

    function getLine(err) {
      if (err) {
        return cb(err);
      }

      if (separatorIndex < 0 && eof) {
        separatorIndex = bufferStr.length;
      }
      var ret = bufferStr.substring(0, separatorIndex);

      bufferStr = bufferStr.substring(separatorIndex + separatorLen);
      separatorIndex = -1;
      cb(undefined, ret);
    }

    findSeparator();

    if (separatorIndex < 0) {
      if (eof) {
        if (hasNextLine()) {
          separatorIndex = bufferStr.length;
          getLine();
        } else {
          return cb(new Error('No more lines to read.'));
        }
      } else {
        readToSeparator(getLine);
      }
    } else {
      getLine();
    }
  }

  readToSeparator(function(err) {
    if (err) {
      onFailure(err);
    } else {
      return creationCb(undefined, {
        hasNextLine: hasNextLine,
        nextLine: nextLine,
        close: close,
        isOpen: isOpen,
        isClosed: isClosed,
        getReadStream: getReadStream
      });
    }
  });
}

function open(sandbox) {
  return (filenameOrStream, options, cb) => {
    if (isFunction(options)) {
      cb = options;
      options = undefined;
    }

    var readStream;

    if (typeof filenameOrStream.read == 'function') {
      readStream = filenameOrStream;
    } else if (typeof filenameOrStream === 'string' || isString(filenameOrStream)) {
      checkPermission(sandbox);
      readStream = fs.createReadStream(filenameOrStream);
    } else {
      cb(new Error('Invalid file argument for LineReader.open.  Must be filename or stream.'));
      return;
    }

    readStream.pause();
    createLineReader(readStream, options, cb);
  };
}

function eachLine(sandbox) {
  return (filename, options, iteratee, cb) => {
    if (isFunction(options)) {
      cb = iteratee;
      iteratee = options;
      options = undefined;
    }
    var asyncIteratee = iteratee.length === 3;

    var theReader;
    var getReaderCb;

    open(sandbox)(filename, options, function(err, reader) {
      theReader = reader;
      if (getReaderCb) {
        getReaderCb(reader);
      }

      if (err) {
        if (cb) cb(err);
        return;
      }

      function finish(err) {
        reader.close(function(err2) {
          if (cb) cb(err || err2);
        });
      }

      function newRead() {
        if (reader.hasNextLine()) {
          return setImmediate(readNext);
        } else {
          finish();
        }
      }

      function continueCb(continueReading) {
        if (continueReading !== false) {
          return newRead();
        } else {
          finish();
        }
      }

      function readNext() {
        reader.nextLine(async function(err, line) {
          if (err) {
            finish(err);
          }

          var last = !reader.hasNextLine();
          var result;

          if (asyncIteratee) {
            try {
              result = await iteratee(line, last, continueCb);
            } catch (e) {
              return finish(e);
            }
          } else {
            try {
              result = iteratee(line, last);
            } catch (e) {
              return finish(e);
            }

            if (result === false) {
              finish();
            } else {
              newRead();
            }
          }
        });
      }

      newRead();
    });

    // this hook is only for the sake of testing; if you choose to use it,
    // please don't file any issues (unless you can also reproduce them without
    // using this).
    return {
      getReader: function(cb) {
        if (theReader) {
          cb(theReader);
        } else {
          getReaderCb = cb;
        }
      }
    };
  };
}
