const env = process.env.NODE_ENV || 'dev';

const dev = {
    env: 'dev',
    apiBaseUrl: 'localhost:8080'
};

const test = {
    env: 'test',
    apiBaseUrl: 'codetudes.com'
};

const config = {
 dev,
 test
};

module.exports = config[env];