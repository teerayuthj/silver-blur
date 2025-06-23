const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    
    return {
        entry: {
            'silver-blur': './scripts/silver-blur.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? '[name].min.js' : '[name].js',
            clean: true,
            library: {
                name: 'SilverBlur',
                type: 'umd'
            },
            globalObject: 'this'
        },
        mode: argv.mode || 'development',
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: false, // Keep console.log for debugging
                            drop_debugger: true,
                            pure_funcs: ['console.debug'] // Remove only debug logs
                        },
                        mangle: {
                            keep_classnames: true,
                            keep_fnames: true
                        },
                        format: {
                            comments: /^!/
                        }
                    },
                    extractComments: false
                })
            ]
        },
        plugins: [
            // Copy CSS and config files
            new CopyPlugin({
                patterns: [
                    {
                        from: 'css/silver-blur.css',
                        to: 'silver-blur.css'
                    },
                    {
                        from: 'config/holidays.json',
                        to: 'config/holidays.json'
                    },
                    {
                        from: 'silver.html',
                        to: 'silver.html'
                    },
                    {
                        from: 'test-blur.html',
                        to: 'test-blur.html'
                    }
                ]
            })
        ],
        resolve: {
            extensions: ['.js']
        },
        target: 'web'
    };
};