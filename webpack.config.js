const path = require('path');
const merge = require('webpack-merge');
const validate = require('webpack-validator');

const parts = require('./libs/parts');

const TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;
const PATHS = {
    app: path.join(__dirname, 'app'),
    style: [
        path.join(__dirname, 'app', 'main.css')
    ],
    build: path.join(__dirname, 'build'),
    test: path.join(__dirname, 'tests')
};
const common = merge(
    {
    // Entry accepts a path or an object of entries. We'll be using the
    // latter form given it's convenient with more complex configurations.
    entry: {
        app: PATHS.app
        },
   output: {
        path: PATHS.build,
        filename: '[name].js'
      // TODO: Set publicPath to match your GitHub project name
      // E.g., '/kanban-demo/'. Webpack will alter asset paths
      // based on this. You can even use an absolute path here
      // or even point to a CDN.
      //publicPath: ''
        },
    // Add resolve.extensions.
    // '' is needed to allow imports without an extension.
    // Note the .'s before extensions as it will fail to match without!!!
    resolve: {
        extensions: ['', '.js', '.jsx']
    },

    },
    parts.indexTemplate({
        title: 'Kanban demo',
        appMountId: 'app'
    }),
    // Parse only app files! Without this it will go through entire project.
    // In addition to being slow, that will most likely result in an error.
    parts.loadJSX(PATHS.app),
    parts.lintJSX(PATHS.app)
);

var config;
// Detect how npm is run and branch based on that
switch (TARGET) {
    case 'build':
    case 'stats':
        config = merge(
            common,
            {
                devtool: 'source-map',
                entry: {
                    style: PATHS.style
                },
                output: {
                    path: PATHS.build,
                    filename: '[name].[chunkhash].js',
                    chunkFilename: '[chunkhash].js'
                }
            },
            parts.clean(PATHS.build),
            // You can set this to 'development' for your
            // development target to force NODE_ENV to development mode
            // no matter what
            parts.setFreeVariable(
                'process.env.NODE_ENV',
                'production'
            ),
            parts.extractBundle({
                name: 'vendor',
                entries: ['react', 'react-dom'],
                // Exclude alt-utils as it won't work with this setup
                // due to the way the package has been designed
                //when exclude is defined, it will ignore the entries and get from package.json
                //current implementation can accept only one moudule for exclusion
                exclude: 'alt-utils' 
            }),
            parts.minify(),
            parts.extractCSS(PATHS.style)
        );
        break;
    case 'test':
    case 'test:tdd':
        config = merge(
            common,
            {
                devtool: 'inline-source-map'
            },
            parts.loadIsparta(PATHS.app),
            parts.loadJSX(PATHS.test)
        );
        break;
    default:
        config = merge(
                    common,
                    {
                        devtool: 'source-map',
                        entry: {
                                    style: PATHS.style
                                }
                    },
                    parts.setupCSS(PATHS.style),
                    parts.devServer({
                        // Customize host/port here if needed
                        host: process.env.HOST,
                        port: process.env.PORT
                        }),
                    parts.enableReactPerformanceTools(),
                    parts.npmInstall()
        );
}
module.exports = validate(config, {
    quiet: true
});