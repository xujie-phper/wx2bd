const path = require('path');
const glob = require('glob');
const babylon = require('babylon');
const generate = require('babel-generator').default;
const config = require('../src/config/index');
const view = require('../src/view/index');
const api = require('../src/api');
const css = require('../src/css');
const utils = require('../src/util/index');
const apiConfig = require('../config/wx2bd/api');

global.console = {
    log: jest.fn()
};

describe('test transform json: ', () => {
    const configs = glob.sync('./test/source/**/*.json');
    configs.forEach(
        file => {
            test(file, () => {
                const jsonContent = utils.getContentSync(file);
                const expected = utils.getContentSync(file.replace(/\.\/test\/source\//, './test/dist/'));
                return config
                    .transform(file, jsonContent, {data: {}})
                    .then(vfile => expect(String(vfile)).toBe(expected));
            });
        }
    );
});

describe('test transform wxml: ', () => {
    const wxmls = glob.sync('./test/source/**/*.wxml');
    wxmls.forEach(
        file => {
            test(file, () => {
                const wxmlContent = utils.getContentSync(file);
                const expected = utils.getContentSync(
                    file.replace(/\.\/test\/source\//, './test/dist/').replace(/\.wxml/, '.swan')
                );
                return view
                    .transformViewContent(
                        file, wxmlContent,
                        {
                            data: {
                                swanToRenamedComponents: {
                                    [path.resolve(process.cwd(), file)]: {
                                        'List': 'list',
                                        'HelloWorld': 'hello-world',
                                        'table_head': 'table-head'
                                    }
                                }
                            }
                        }
                    )
                    .then(vfile => expect(String(vfile)).toBe(expected));
            });
        }
    );
});

test('test transfrom js: ', () => {
    glob('./test/source/**/*.js', {ignore: '**/node_modules/**/*.js'}, function (err, files) {
        for (let i = 0; i < files.length; i++) {
            const sourceContent = utils.getContentSync(files[i]);
            const distContent = utils.getContentSync(files[i].replace(/\.\/test\/source\//, './test/dist/'));
            const afterTransform = api.transformApiContent(sourceContent, apiConfig, 'wx', apiConfig.ctx);

            const sourceContentForm = generate(babylon.parse(afterTransform, {sourceType: 'module', plugins: '*'}), {concise: true}).code;
            const distContentForm = generate(babylon.parse(distContent, {sourceType: 'module', plugins: '*'}), {concise: true}).code;
            expect(sourceContentForm).toBe(distContentForm);
        }
    });

});

test('test transfrom wxss: ', () => {
    glob('./test/source/**/*.wxss', function (err, files) {
        for (let i = 0; i < files.length; i++) {
            const sourceContent = utils.getContentSync(files[i]);
            const distContent = utils.getContentSync(files[i].replace(/\.\/test\/source\//, './test/dist/').replace(/\.wxss/, '.css'));
            expect(css.transformCssContent(sourceContent)).toBe(distContent);
        }
    });

});
