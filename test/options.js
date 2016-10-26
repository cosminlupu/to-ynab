"use strict";

/*
Main Test
==============
General app tests
*/

const fs = require('fs-extra');
const assert = require('chai').assert;

const ynab_generator = require('../index');
const sources = require('../sources');
const config = require('./config/config');


describe("Options", () => {
    
    describe("opts.source", () => {
        it("Should be able to specify opts.source", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir + '/nordea',
                source: 'nordea'
            }).then( (result) => {
                assert.equal(result, `File ${config.testDir}/nordea.csv written successfully!`);
                assert.isOk(fs.existsSync(config.testDir + '/nordea.csv'), 'File was generated in test folder');
            });
        });

        it("Should not be able to specify a non supported source in opts.source", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir + '/ussource',
                source: 'ussource'
            }).catch( (err) => {
                assert.instanceOf(err, Error);
                assert.include(err.message, Object.keys(sources) );
                assert.isNotOk(fs.existsSync(config.testDir + '/ussource.csv'), 'File was not generated in test folder');
            });
        });
    
    });

    describe("opts.output", () => {
        it("Should generate a ynab.csv file when opts.output is a directory", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir
            }).then( (result) => {
                assert.equal(result, `File ${config.testDir}/ynab.csv written successfully!`);
                assert.isOk(fs.existsSync(config.testDir + '/ynab.csv'), 'File was generated in test folder');
            });
        });

        it("Should generate a test.csv file when opts.output is a file", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir + '/test.csv'
            }).then( (result) => {
                assert.equal(result, `File ${config.testDir}/test.csv written successfully!`);
                assert.isOk(fs.existsSync(config.testDir + '/test.csv'), 'File was generated in test folder');
            });
        });

        it("Should not overwrite extension if opts.output extension is not .csv", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir + '/test.v1'
            }).then( (result) => {
                assert.equal(result, `File ${config.testDir}/test.v1.csv written successfully!`);
                assert.isOk(fs.existsSync(config.testDir + '/test.v1.csv'), 'File was generated in test folder');
            });
        });
    });

    describe("opts.output", () => {
        it("Should generate a ynab.csv file when opts.output is a directory", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir
            }).then( (result) => {
                assert.equal(result, `File ${config.testDir}/ynab.csv written successfully!`);
                assert.isOk(fs.existsSync(config.testDir + '/ynab.csv'), 'File was generated in test folder');
            });
        });

        it("Should generate a test.csv file when opts.output is a file", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir + '/test.csv'
            }).then( (result) => {
                assert.equal(result, `File ${config.testDir}/test.csv written successfully!`);
                assert.isOk(fs.existsSync(config.testDir + '/test.csv'), 'File was generated in test folder');
            });
        });

        it("Should not overwrite extension if opts.output extension is not .csv", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir + '/test.v1'
            }).then( (result) => {
                assert.equal(result, `File ${config.testDir}/test.v1.csv written successfully!`);
                assert.isOk(fs.existsSync(config.testDir + '/test.v1.csv'), 'File was generated in test folder');
            });
        });
    });

    describe("opts.payees", () => {

        it("Should add payees to generated csv when opts.payees is specified and the payees are found in the memo", () => {
            const existingPayees = ['Drive now', 'Spotify'];

            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir,
                payees: existingPayees
            }).then( () => {
                const generatedData = fs.readFileSync(`./${config.testDir}/ynab.csv`, 'utf8').trim();
                
                existingPayees.forEach( (payee) => {
                    const regex = new RegExp(`^[^;]+;${payee};`, 'm');

                    assert.isOk(regex.test(generatedData), 'Payee was found');
                });
            });
        });

        it("Should not add payees to generated csv when opts.payees is specified and the payees are not found in the memo", () => {
            const nonexistingPayees = ['CrazyPayee', 'StrangePayee'];

            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir,
                payees: nonexistingPayees
            }).then( () => {
                const generatedData = fs.readFileSync(`./${config.testDir}/ynab.csv`, 'utf8').trim();
                
                nonexistingPayees.forEach( (payee) => {
                    const regex = new RegExp(`^[^;]+;${payee};`, 'm');

                    assert.isNotOk(regex.test(generatedData), 'Payee was not found');
                });
            });
        });
    });

    describe("opts.delimitor", () => {
        it("Should generate new .csv file with the opts.delimitor provided", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[5]}`, {
                output: config.testDir,
                delimitor: '|'
            }).then( () => {
                const generatedData = fs.readFileSync(`./${config.testDir}/ynab.csv`, 'utf8').trim();
                const regex = new RegExp('^Date|Payee|');

                assert.isOk(regex.test(generatedData), `Delimitor option works`);
            });
        });
    });

    describe("opts.lastdate", () => {
        it("Should not add transactions past the opts.lastdate provided", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir,
                lastdate: '11/10/2016'
            }).then( () => {
                const generatedData = fs.readFileSync(`./${config.testDir}/ynab.csv`, 'utf8').trim();
                const regex = new RegExp('12/10/2016', 'g');

                assert.isNotOk(regex.test(generatedData), `No transaction with date past 11/10/2016`);
            });
        });

        it("Should throw error if opts.lastdate is not in a right format", () => {
            const wrongDate = '11-10-2016';

            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir,
                lastdate: wrongDate
            }).catch( (err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, `${wrongDate} is not a valid date for DD/MM/YYYY date format`);
            });
        });
    });

    describe("opts.dateformat", () => {
        it("Should add correct date format if opts.lastdate provided", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir,
                dateformat: 'DD.MM.YYYY'
            }).then( () => {
                const generatedData = fs.readFileSync(`./${config.testDir}/ynab.csv`, 'utf8').trim();
                const regex = new RegExp('12.10.2016', 'g');
                
                assert.isOk(regex.test(generatedData), `Correct date format added`);
            });
        });

        it("Should throw error if opts.dateformat is not in a right format", () => {
            const wrongFormat = "DD=MM=YYYY";
            const allowedDateFormats = ["DD/MM/YYYY", "YYYY/MM/DD", "YYYY-MM-DD", "DD-MM-YYYY", "DD.MM.YYYY", "MM/DD/YYYY", "YYYY.MM.DD"];

            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir,
                dateformat: wrongFormat
            }).catch( (err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, `Date format ${wrongFormat} is not valid. List of valid dateformats: [ ${allowedDateFormats} ]`);
            });
        });
    });

    describe("opts.write", () => {
        it("Should not write to file if opts.write is false", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir,
                write: false,
            }).then( () => {
                assert.isNotOk(fs.existsSync(config.testDir + '/ynab.csv'), 'File was not generated in test folder');
            });
        });

        it("Should return generated file if opts.write is false", () => {
            return ynab_generator(`./${config.testDir}/${config.testFiles[0]}`, {
                output: config.testDir,
                write: false,
            }).then( (result) => {
                const regex = new RegExp('Date;Payee;Category;Memo');

                assert.isOk(regex.test(result), 'Generated csv was outputed');
            });
        });
    });

    describe("opts.csvstring", () => {
        it("Should generate csv file from a string instead of file if opts.csvstring is provided", () => {
            const fileString = fs.readFileSync(`./${config.testDir}/${config.testFiles[0]}`, 'utf8').trim();

            return ynab_generator(fileString, {
                output: config.testDir,
                csvstring: true
            }).then( (result) => {
                assert.equal(result, `File ${config.testDir}/ynab.csv written successfully!`);
                assert.isOk(fs.existsSync(config.testDir + '/ynab.csv'), 'File was generated in test folder');
            });
        });

        it("Should throw error if opts.csvstring specified and file string is empty", () => {
            return ynab_generator("", {
                output: config.testDir,
                csvstring: true
            }).catch( (err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.message, "A valid csv string needs to be provided");
            });
        });
    });
});
