'use strict';

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const os = require('os');

const { app, getNetworkInterfaces } = require('../server');

describe('GET /health', () => {

    test('responds with 200 and an ok status', async () => {
        const res = await request(app).get('/health');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.status, 'ok');
        assert.strictEqual(res.body.message, 'we are up and running 😘');
    });

});

describe('GET /', () => {

    const POD_ENV_VARS = ['MY_POD_NAMESPACE', 'MY_POD_NAME', 'MY_POD_IP'];
    const saved = {};

    beforeEach(() => {
        POD_ENV_VARS.forEach((name) => {
            saved[name] = process.env[name];
            delete process.env[name];
        });
    });

    afterEach(() => {
        POD_ENV_VARS.forEach((name) => {
            if (saved[name] === undefined) {
                delete process.env[name];
            } else {
                process.env[name] = saved[name];
            }
        });
    });

    test('responds with 200 and the expected body shape', async () => {
        const before = Date.now();
        const res = await request(app).get('/');
        const after = Date.now();

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.status, 'ok');
        assert.ok('namespace' in res.body);
        assert.ok('hostname' in res.body);
        assert.ok('ip' in res.body);
        assert.ok(res.body.timestamp >= before && res.body.timestamp <= after);
    });

    test('falls back to os values when pod env vars are not set', async () => {
        const res = await request(app).get('/');

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.namespace, 'docker');
        assert.strictEqual(res.body.hostname, os.hostname());
        assert.ok(Array.isArray(res.body.ip));
    });

    test('uses pod env vars when set', async () => {
        process.env.MY_POD_NAMESPACE = 'production';
        process.env.MY_POD_NAME = 'helloworld-abc123';
        process.env.MY_POD_IP = '10.0.0.42';

        const res = await request(app).get('/');

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.namespace, 'production');
        assert.strictEqual(res.body.hostname, 'helloworld-abc123');
        assert.strictEqual(res.body.ip, '10.0.0.42');
    });

});

describe('unknown routes', () => {

    test('responds with 404', async () => {
        const res = await request(app).get('/does-not-exist');
        assert.strictEqual(res.status, 404);
    });

});

describe('getNetworkInterfaces', () => {

    test('returns external IPv4 addresses keyed by interface name', () => {
        const ifaces = {
            eth0: [
                { family: 'IPv4', internal: false, address: '192.168.1.10' },
                { family: 'IPv6', internal: false, address: 'fe80::1' }
            ],
            eth1: [
                { family: 'IPv4', internal: false, address: '10.0.0.5' }
            ]
        };

        assert.deepStrictEqual(getNetworkInterfaces(ifaces), [
            { eth0: '192.168.1.10' },
            { eth1: '10.0.0.5' }
        ]);
    });

    test('filters out internal interfaces', () => {
        const ifaces = {
            lo: [
                { family: 'IPv4', internal: true, address: '127.0.0.1' }
            ]
        };

        assert.deepStrictEqual(getNetworkInterfaces(ifaces), []);
    });

    test('filters out non-IPv4 addresses', () => {
        const ifaces = {
            eth0: [
                { family: 'IPv6', internal: false, address: '::1' }
            ]
        };

        assert.deepStrictEqual(getNetworkInterfaces(ifaces), []);
    });

    test('returns an empty array when there are no interfaces', () => {
        assert.deepStrictEqual(getNetworkInterfaces({}), []);
    });

});
