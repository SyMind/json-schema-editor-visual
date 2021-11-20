const fs = require('fs');
const assign = require('object-assign');
const getProjectPath = require('./getProjectPath');

module.exports = () => {
    let my = {};
    const tsConfigPath = getProjectPath('tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
        my = require(tsConfigPath);
    }

    return assign({
        noUnusedParameters: true,
        noUnusedLocals: true,
        strictNullChecks: true,
        target: 'es6',
        jsx: 'preserve',
        moduleResolution: 'node',
        declaration: true,
        allowSyntheticDefaultImports: true
    }, my.compilerOptions);
};
