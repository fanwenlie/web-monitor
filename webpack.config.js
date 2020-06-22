const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  context: process.cwd(),
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'monitor.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '前端监控',
      template: './public/index.html',
      inject: 'head',
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 8080,
    useLocalIp: false,
    hot: true,
    clientLogLevel: 'error',
    overlay: {
      warnings: true,
      errors: true
    },
    stats: {
      modules: false,
      children: false,
    },
    before(router) {
      router.get('/success', function (req, res) {
        res.json({ id: 1 })
      })
      router.post('/error', function (req, res) {
        res.sendStatus(500)
      })
    }
  },
}