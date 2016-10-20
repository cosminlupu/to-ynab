"use strict";

const sources = {
    nordea: {
        headers: ['Bogført', 'Tekst', 'Rentedato', 'Beløb', 'Saldo'],
        map: {
            date: 0,
            payee: null,
            category: null,
            memo: 1,
            outflow: 3,
            inflow: 3
        },
        dateformat: 'DD-MM-YYYY',
        delimitor: ';'
    }
};

module.exports = sources;
