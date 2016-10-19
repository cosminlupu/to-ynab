/*
Nordea source tests
==============
*/

const fs = require('fs-extra');
const assert = require('chai').assert;

const ynab_generator = require('../../index');
const sourceConfig = require('../../sources').nordea;
const config = require('../config/config');


describe("Sources", () => {
    
    describe("Nordea", () => {

        it("Should find source headings in provided csv if conversion works", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                    output: config.testDir + '/nordeasource',
                    source: 'nordea'
                }).then( (result) => {
                    var origData = fs.readFileSync(`./${config.testDir}/${config.testFiles[0]}`, 'utf8').trim();
                    assert.equal(origData.indexOf(sourceConfig.headers.join(';')), 0, 'Headers are in the right order and first in the file');
                });
        });

        it("Should return error if source headings are not the same as provided csv", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[1]}`, {
                    output: config.testDir + '/nordeasource',
                    source: 'nordea'
                }).catch( (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.message, `CSV headers are not the same as the source config headers. Expected header rows: [ ${sourceConfig.headers.join(';')} ]`);
                });
        });
    
    });

});
