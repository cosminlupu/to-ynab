to-ynab
====
_by @cosminlupu_

> Converts bank ( and other sources ) .csv files to .csv files ready to import in YNAB ( [youneedabudget.com](https://youneedabudget.com/) ) 

* **GitHub:** <https://github.com/cosminlupu/to-ynab>

## Features
* CSV conversion
* API to use _to-ynab_ programmatically
* CLI for easy use

### TODO

* Support for more .csv sources ( Currently only Nordea bank )
* Support for own source config via a json file

## How to install
To use _to-ynab_ via cli, install it globally using **npm**:
```
npm install -g to-ynab
```

If you want to use the API instead, install it locally:
```
npm install --save to-ynab
```

then, include it in your javascript:
```js
var to-ynab = require('to-ynab');
```

## How to use via CLI
To create a YNAB ready `.csv` file from your own .csv file
```
to-ynab <file.csv>
```
For example:
```
to-ynab transactions.csv
```
Will generate `ynab.csv`.

### Available CLI options
* `-h`, `--help`                output usage information
* `-V`, `--version`             output the version number
* `-s`, `--source [value]`      Source to use for reading the provided csv. Default: `nordea`
* `-o`, `--output [value]`      Output filename (with or without .csv extension). Default: `ynab`
* `-l`, `--lastdate [value]`    Last date for a transaction to be added to generated csv.
* `-p`, `--payees [payees]`     List of payees to match in description, comma separated.
* `-d`, `--delimitor [value]`   Cell delimitor in source file ( same one will be used in generated file). Default: `;`
* `-c`, `--csvstring`           Provide a csv string instead of file
* `-n`, `--no-write`            Does not write the generated file, it just outputs it.
* `-f`, `--dateformat [value]`  Date format for the generated csv. Default: `DD/MM/YYYY`



## How to use via API
Include _to-ynab_ in your javascript with:
```js
let to-ynab = require('to-ynab');
```

Then to render a csv file:
```js

to-ynab('transactions.csv')
    .then( (result) => {
        console.log(result); //In this case result will a success message with the location of the generated file
    }).catch( (err) => {
        console.log(err);
    });
```

Passing options:
```js

to-ynab('transactions.csv', {
        output: myfile.csv,
        write: false
    }).then( (result) => {
        console.log(result); //In this case result will be a string version of the generated file
    }).catch( (err) => {
        console.log(err);
    });
```

### Available API options
```js
{
    source: 'nordea',                   //Source to use for reading the provided csv. Default: _nordea_
    output: 'ynab',                     //Output filename (with or without .csv extension). Default: _ynab_
    lastdate: '18/10/2016',             //Last date for a transaction to be added to generated csv.
    payees: ['Just eat', 'Spotify'],    //List of payees to match in description, comma separated.
    delimitor: ';',                     //Cell delimitor in source file ( same one will be used in generated file). Default: _;_
    csvstring: false,                   //Provide a csv string instead of file
    write: true,                        //Writes the contents to file. Default: _true_
    dateformat: 'DD/MM/YYYY'            //Date format for the generated csv. Default: _DD/MM/YYYY_
}
```

## Developing / extending

* To install dependencies execute `npm install`
* To test, execute `npm test` ( This will run _Mocha_ tests and _Instanbul_ coverage report)
* To execute the CLI, execute `npm start -- <file.csv> [options]`
* To install your local version globally, execute `npm install -g .` on the project folder ( Only use for development)


## How to contribute
To contribute to **to-ynab** you should fork this repository with `git`.

1. Make a change that you might see fit on your own fork ( using _develop_ branch )
2. Create tests for your change, and also make sure the existing tests pass
4. Only make pull requests from the develop branch. Pull requests from master won't be merged
5. Check the opened and closed issues before creating one

Thanks for your help!

## License
MIT
