"use strict";

/*
Main Test
==============
General app tests
*/

const fs = require('fs-extra');
const moment = require('moment');
const assert = require('chai').assert;

const ynab_generator = require('../index');
const config = require('./config/config');

describe("Main", () => {
    after( (done) => {
        //Remove file from project root
        fs.remove(process.cwd() + '/ynab.csv', (err) => {
            assert.isNotOk(err);
            done();
        });
    });

    it("Can require module", (done) => {
        assert.isOk(ynab_generator);
        done();
    });

    it("Should return error if a file is not passed", () => {
        return ynab_generator()
            .catch( (err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, "A valid .csv file needs to be provided");
            });
    });

    it("Should return error if called a file without .csv is passed", () => {
        return ynab_generator('file.xls')
            .catch( (err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, "File provided is does not have a .csv extension");
            });
    });
    
    it("Should return error if csv file is empty", () => {
        return ynab_generator(`./${config.testDir}/${config.testFiles[3]}`)
            .catch( (err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, "CSV file is empty");
            });
    });

    it("Should return error if csv contains only header rows", () => {
        return ynab_generator(`./${config.testDir}/${config.testFiles[2]}`)
            .catch( (err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, "CSV file only contains the header row");
            });
    });

    it("Should generate a ynab.csv file without any options in process.cwd() folder", () => {
        return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`)
            .then( (result) => {
                assert.equal(result, "File ynab.csv written successfully!");
                assert.isOk(fs.existsSync(process.cwd() + '/ynab.csv'), 'File was generated in root');
            });
    });

    it("Should add today's date if no date provided or date is invalid", () => {
        return ynab_generator(`./${config.testDir}/${config.testFiles[4]}`, {
            output: config.testDir,
        }).then( () => {
            const generatedData = fs.readFileSync(`./${config.testDir}/ynab.csv`, 'utf8').trim();
            const regex = new RegExp(moment().format('DD/MM/YYYY'), 'g');
            
            assert.isOk(regex.test(generatedData), 'File contains today\'s date');
        });
    });
});
