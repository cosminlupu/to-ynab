#!/usr/bin/env node

const ynab_generator = require('../index.js');
const program = require('commander');
let file;
let options = {};

program
    .version('0.0.1')
    .description('Generates a csv file in format readable by YNAB. ( youneedabudget.com )')
    .usage('[options] <filename.csv | csvstring>')
    .arguments('<file>')
    .option('-s, --source [value]', 'Source to use for reading the provided csv. Default: nordea', 'nordea')
    .option('-o, --output [value]', 'Output filename (with or without .csv extension). Default: ynab', 'ynab')
    .option('-l, --lastdate [value]', 'Last date for a transaction to be added to generated csv.')
    .option('-p, --payees [payees]', 'List of payees to match in description, comma separated.', (v) => v.split(','), [] )
    .option('-d, --delimitor [value]', 'Cell delimitor in source file ( same one will be used in generated file). Default: ;', ';')
    .option('-c, --csvstring', 'Provide a csv string instead of file')
    .option('-n, --no-write', 'Does not write the generated file, it just outputs it.')
    .option('-f, --dateformat [value]', 'Date format for the generated csv. Default: DD/MM/YYYY', 'DD/MM/YYYY')
    .action( (f) => file = f )
    .parse(process.argv);

//Loop options and add them to the options obj
['source', 'output', 'lastdate', 'payees', 'delimitor', 'csvstring', 'write', 'dateformat']
.forEach( (opt) => {
    if(program.hasOwnProperty(opt)){
        options[opt] = program[opt];
    }
});

ynab_generator( file, options )
//Success
.then( (data) => {
    console.log(data);
    process.exit(0);
})
//Errors
.catch( (e) => {
    console.log(e.toString());
    program.outputHelp();
    process.exit(1);
});
