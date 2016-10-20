"use strict";

const fs = require('fs');
const moment = require('moment');
const sources = require('./sources');
const path = require('path');
const YNABHeadings = ['Date', 'Payee', 'Category', 'Memo', 'Outflow', 'Inflow'];

//Default optionss
let options;
let sourceConfig;

//TODO: Be able to provide string of data instead of file
 
function generate(file, opts){
    if(typeof opts === 'undefined') opts = {};

    options = {
        source: 'nordea',
        delimitor: ';',
        dateformat: 'DD/MM/YYYY',
        payees: [],
        path: '.',
        output: 'ynab',
        csvstring: false,
        write: true
    };

    return new Promise( (resolve, reject ) => {
        validateOptions(opts)
            .then( (opts) => {
                options = util.extend(options, opts);
                sourceConfig = sources[options.source];

                //Check if the source provides a delimitor and not overwritten by a provided option
                if(!opts.delimitor && sourceConfig.delimitor){
                    options.delimitor = sourceConfig.delimitor;
                }
            })
            .then( () => loadFile(file) )
            .then( getCSVRows )
            .then( generateCSV )
            .then( writeCSV )
            .then( resolve )
            .catch( reject );
    });
}

function validateOptions(opts){
    return new Promise((resolve, reject) => {
        //Validate source
        if(opts.source && !sources.hasOwnProperty(opts.source)){
            reject(Error(`Source ${opts.source} is not valid. List of valid sources: [ ${Object.keys(sources)} ]`)); return;
        }

        //Validate dateformat
        let allowedDateFormats = ["DD/MM/YYYY", "YYYY/MM/DD", "YYYY-MM-DD", "DD-MM-YYYY", "DD.MM.YYYY", "MM/DD/YYYY", "YYYY.MM.DD"];
        if(opts.dateformat && allowedDateFormats.indexOf(opts.dateformat) === -1){
            reject(Error(`Date format ${opts.dateformat} is not valid. List of valid dateformats: [ ${allowedDateFormats} ]`)); return;
        }

        //Validate last date
        let dateformat = opts.dateformat || options.dateformat;
        if(opts.lastdate && !moment(opts.lastdate, dateformat, true).isValid() ){
            reject(Error(`${opts.lastdate} is not a valid date for ${dateformat} date format`)); return;
        }

        //Validate output
        if(opts.output){
            opts.output = opts.output.replace(/\.csv$/i, '');

            //Directory
            try{
                let stats = fs.lstatSync(opts.output);
                if (stats.isDirectory()) {
                    opts.path = opts.output;
                    delete opts.output;
                }            
            } catch(e){
                //Files should be ignored    
            }
        }

        resolve(opts);
    });
}

function loadFile(file){
    return new Promise((resolve, reject) => {

        //Check if we have a csv string provided
        if(options.csvstring && !file){
            reject(Error('A valid csv string needs to be provided')); return;
        }

        //Check if we have a csv string provided
        if(options.csvstring && file){
            resolve(file); return;
        }

        //Check if file provided
        if(!file){
            reject(Error('A valid .csv file needs to be provided')); return;
        }

        //Validate csv file
        if(!/.*\.csv$/i.test(file)){
            reject(Error('File provided is does not have a .csv extension')); return;
        }

        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                reject(err); return;
            }
            
            resolve(data);
        });
    });
}

function getCSVRows(data){
    return new Promise((resolve, reject) => {
        //Check if any data
        if(!data.toString()){
            reject(Error('CSV file is empty')); return;
        }

        var rows = data.toString().replace(/\r/g, '').split('\n').filter( row => !!row );
        var headerCells = rows.shift().split( options.delimitor ).filter( cell => !!cell );

        //Check if any data rows
        if(!rows.length && headerCells.length){
            reject(Error('CSV file only contains the header row')); return;
        }
        
        //Check if the csv heading cells are the same as the source config
        if( (sourceConfig.headers.length !== headerCells.length) || !sourceConfig.headers.every((h,i)=> h == headerCells[i]) ) {
            reject(Error(`CSV headers are not the same as the source config headers. Expected header rows: [ ${sourceConfig.headers.join(options.delimitor)} ]`)); return;
        }

        resolve(rows);
    });
}

function generateCSV(rows){
    return new Promise((resolve, reject) => {
        var newData = YNABHeadings.join(';') + '\n';

        rows.forEach( (row, y) => {
            let cells = row.split(options.delimitor).filter( c => !!c );

            //Check if we're exceeding the last date
            var date = moment(cells[sourceConfig.map.date], sourceConfig.dateformat);
            var lastDate = options.lastdate ? moment(options.lastdate, options.dateformat) : false;
            var renderRow = !options.lastdate || date.isSameOrBefore(lastDate);

            if(renderRow){
                YNABHeadings.forEach( (h, i) => {
                    var heading = h.toLowerCase();

                    newData += createField[heading]( cells[ sourceConfig.map[heading] ], cells );

                    if(i !== YNABHeadings.length -1){
                        newData += ';';
                    }
                });

                if(y !== rows.length -1){
                    newData += '\n';
                }
            }
        });

        resolve(newData);
    });
}

function writeCSV(data){
    return new Promise((resolve, reject) => {

        //If no write, output file
        if(!options.write){
            resolve(data); return;
        }

        let filename = path.join(options.path, options.output + '.csv');

        fs.writeFile(filename, data, function (err) {
            if (err){
                reject(err); return;  
            } 
            resolve(`File ${filename} written successfully!`);
        });
    });   
}

class createField{
    static date(val){
        
        if(sourceConfig.map.date === null) return '';
        
        var date = moment(val, sourceConfig.dateformat).format(options.dateformat);
        
        //For invalid date return today's date
        if(date == 'Invalid date'){
            date = moment().format(options.dateformat);
        }

        return date;
    }

    static payee(val, cells){
        if(sourceConfig.map.payee == null && options.payees.length) {
            var payee = '';

            for(var i = 0; i < options.payees.length; i++){
                if(payee) break;

                var regexp = new RegExp(options.payees[i], 'i');

                if(regexp.test( cells[sourceConfig.map.memo] ) ){
                    payee = options.payees[i];
                }
            }

            return payee;
        } else {
            if(sourceConfig.map.payee == null) return '';

            return val;
        }
    }

    static category(val){
        if(sourceConfig.map.category == null) return '';

        return val;
    }

    static memo(val){
        if(sourceConfig.map.memo == null) return '';

        return val.replace(/\s{2,100}/g, ' ');
    }

    static inflow(val){
        if(sourceConfig.map.inflow == null) return '';

        val = val.replace(',', '.');

        if(sourceConfig.map.outflow == sourceConfig.map.inflow && val.indexOf('-') == 0){
            return '';
        }

        return Math.abs(parseFloat(val));
    }

    static outflow(val){
        if(sourceConfig.map.outflow == null) return '';

        val = val.replace(',', '.');

        if(sourceConfig.map.outflow == sourceConfig.map.inflow && val.indexOf('-') == -1){
            return '';
        }

        return Math.abs(parseFloat(val));
    }
}

let util = {
    extend: function(obj1, obj2){
        var obj3 = {};

        Object.keys(obj1).forEach( key => {
            obj3[key] = obj1[key];
        });

        Object.keys(obj2).forEach( key => {
            obj3[key] = obj2[key];
        });

        return obj3;
    }
}

module.exports = generate;
