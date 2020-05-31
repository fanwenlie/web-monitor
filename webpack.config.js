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
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '前端监控',
      template: './src/index.html',
      inject: 'head',
    })
  ],
}