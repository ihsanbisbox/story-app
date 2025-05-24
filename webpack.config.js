const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = argv.mode === 'development';
  
  const config = {
    entry: './src/js/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]'
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: 'body',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false
      }),
      new Dotenv({
        path: './.env',
        safe: true,
        systemvars: true,
        silent: true
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '',
            globOptions: {
              ignore: [
                '**/index.html',
                '**/service-worker.js'
              ]
            }
          },
          {
            from: 'public/manifest.json',
            to: 'manifest.json'
          }
        ]
      }),
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: '/',
        generate: (seed, files, entries) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          
          const entrypointFiles = entries.main.filter(
            fileName => !fileName.endsWith('.map')
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      })
    ],
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'dist'),
        },
        {
          directory: path.join(__dirname, 'public'),
          publicPath: '/',
        }
      ],
      compress: true,
      port: 9000,
      hot: true,
      historyApiFallback: true,
      open: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      devMiddleware: {
        writeToDisk: false,
      }
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            chunks: 'all',
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    }
  };

  // Production-specific configurations
  if (isProduction) {
    config.plugins.push(
      new WorkboxPlugin.GenerateSW({
        swDest: 'service-worker.js',
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dicoding-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          }
        ],
        navigateFallback: '/index.html',
        exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/, /\.htaccess$/],
      })
    );

    config.performance = {
      hints: 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    };
  }

  // Development-specific configurations
  if (isDevelopment) {
    config.devtool = 'eval-source-map';
    
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public/sw-dev.js',
            to: 'service-worker.js',
            transform: {
              transformer: (content) => content,
              cache: false
            }
          }
        ]
      })
    );
  }

  return config;
};