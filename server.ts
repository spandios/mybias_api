import app from './app';
const port =
  process.env['NODE_ENV'] === 'test'
    ? 2001
    : process.env['NODE_ENV'] === 'production'
    ? 8080
    : process.env['NODE_ENV'] === 'ecs'
    ? 80
    : 2000;
app.listen(port, () => {
  console.log('  App is running at http://localhost:%d in %s mode', port, process.env['NODE_ENV']);
});
