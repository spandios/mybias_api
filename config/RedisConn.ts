import redis from 'redis';

export const initRedis = () => {
  const client = redis.createClient(
    6379,
    process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'ecs'
      ? process.env.REDIS_URL
      : '127.0.0.1',
  );
  client.on('error', function (err) {
    console.log('Redis Error ' + err);
  });

  client.on('connect', function () {});

  return client;
};
