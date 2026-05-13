const  { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password:process.env.REDIS_PASS ,
    socket: {
        host: 'redis-19337.crce217.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 19337
    }
});
redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
});

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis Cloud');
});

module.exports = redisClient;



