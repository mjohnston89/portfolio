const theConfig = require('./env.json');
const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const config = {
  entry: {
    main: path.resolve(__dirname, './src/index.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: true,
          output: {
            comments: false,
            beautify: false
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './src/static'),
        to: 'static',
        ignore: ['.*']
      }
    ])
  ]
}

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development'
  // Add style rule and plugin
  config.module.rules.push({
    test: /\.scss$/,
    use: [
      isDev ? 'style-loader': MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: { minimize: !isDev }
      },
      'postcss-loader',
      'sass-loader'
    ]
  })
  config.plugins.push(new MiniCssExtractPlugin({
    filename: isDev ? 'style.css' : 'style.[hash].css',
    chunkFilename: isDev ? '[id].css' : '[id].[hash].css',
    minimize: !isDev
  }))
  config.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(__dirname, './src/index.html'),
    inject: true,
    mode: argv.mode,
    ga: theConfig.ga
  }))
  if (isDev) {
    // Dev Server
    config.devServer = {
      hot: true,
      port: 8080,
      open: false,
      overlay: true,
      contentBase: './dist',
      publicPath: '/',
      watchOptions: {
        poll: false,
      },
      before(app, server) {
        server._watch(path.resolve(__dirname, './dist/index.html'));
      }
    };
    config.devtool = 'inline-source-map';
    // Plugins
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  } else if (argv.mode === 'production') {

  }

  return config;
}