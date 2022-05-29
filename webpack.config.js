// Generated using webpack-cli https://github.com/webpack/webpack-cli

import {
  fileURLToPath
} from 'url';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(
  import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  devServer: {
    open: true,
    host: 'localhost',
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      favicon: './assets/favicon.ico',
    }),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [{
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader', // inject CSS to page
        }, {
          loader: 'css-loader', // translates CSS into CommonJS modules
        }, {
          loader: 'postcss-loader', // Run post css actions
          options: {
            postcssOptions: {
              plugins: [autoprefixer()],
            }
          },
        }, {
          loader: 'sass-loader', // compiles Sass to CSS
        }],
      },
    ],
  },
};

export default () => {
  if (isProduction) {
    config.mode = 'production';


  } else {
    config.mode = 'development';
  }
  return config;
};