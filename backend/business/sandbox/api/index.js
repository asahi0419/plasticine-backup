import { createRequire } from 'module';
const Require = createRequire(import.meta.url);

import Promise from 'bluebird';
import FormData from 'form-data';
import sftpClient from 'ssh2-sftp-client';
import lodash from 'lodash-es';
import * as minio from 'minio';
import moment from 'moment';
import base64 from 'base-64';
import utf8 from 'utf8';
import cheerio from 'cheerio';
import crypto from 'crypto';
import qs from 'qs';
import net from 'net';
import knex from 'knex';
import puppeteer from 'puppeteer';
import poplib from 'poplib';
import nodemailer from 'nodemailer';
import knexSchemaInspector from 'knex-schema-inspector';
import * as mailparser from 'mailparser';
import { strict as assert } from 'assert';

import redis from './redis.js';
import db from '../../../data-layer/orm/index.js';
import * as HELPERS from '../../helpers/index.js';
import PopClient from '../../messenger/retrievers/pop/client.js';

import pNamespace from './p/index.js';
import utilsNamespace from './utils/index.js';
import helpersNamespace from './helpers/index.js';
import externalNamespace from './external/index.js';
import globalNamespace from './global/index.js';

export default async (sandbox, context) => {
  const result = {
    console,
    assert,
    knex,
    knexSchemaInspector,
    db,
    Buffer,
    Promise,
    FormData,
    sftpClient,
    lodash,
    minio,
    moment,
    base64,
    utf8,
    cheerio,
    crypto,
    qs,
    net,
    nodemailer,
    setTimeout,
    redis,
    puppeteer,
    poplib,
    mailparser,
    PopClient,
    aws: Require('aws-sdk'),
    gzip: HELPERS.gzip,
    ungzip: HELPERS.ungzip,
    soap: Require('soap'),
    xml2js: Require('xml2js'),
    twofactor: Require('node-2fa'),
    p: pNamespace(sandbox),
    utils: utilsNamespace(sandbox),
    helpers: helpersNamespace(sandbox),
    ...(await externalNamespace(sandbox)),
  };

  return Object.assign(
    {},
    result,
    globalNamespace(context, result),
  );
};
