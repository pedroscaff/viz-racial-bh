#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const csv = require('fast-csv');
const colors = require('colors');
const spawnSync = require('child_process').spawnSync;

if (!argv.from || !(typeof argv.from === 'string')) {
    console.log(colors.red.bold('file not given or invalid'));
    process.exit(0);
}

const source = argv.from;

const dest = argv.dest || (source.split('.')[0] + '-parsed.csv');

let child = spawnSync(
    './dados/scripts/copy_file.sh', [source, dest], {timeout: 10000}
);
if (child.status !== 0) {
    console.log(colors.red.bold('error parsing csv'));
    process.exit(child.status);
}

child = spawnSync(
    './dados/scripts/remove_dollar.sh', [dest], {timeout: 10000}
);
if (child.status !== 0) {
    console.log(colors.red.bold('error parsing csv'));
    process.exit(child.status);
}

child = spawnSync(
    './dados/scripts/semicol_to_comma.sh', [dest], {timeout: 10000}
);
if (child.status !== 0) {
    console.log(colors.red.bold('error parsing csv'));
    process.exit(child.status);
}


let stream = fs.createReadStream(dest, 'utf-8');

const options = {
    headers: [
        'Doador', 'CPF/CNPJ', 'Doador Originario',
        'CPF/CNPJ Originario', 'Data', 'Num Recibo Eleitoral',
        'Valor', 'Especie do Recurso', 'Num Documento',
        'Nome do Candidato', 'Numero do Candidato', 'Candidatura',
        'Partido', 'Unidade Eleitoral', 'Fonte do Recurso', '', ''
    ]
};

let parsedCsv = [];

let csvStream = csv
    .fromStream(stream, options)
    .on("data", (data) => {
        data['Valor'] = data['Valor'].split('.').join('');
        data['Valor'] = +data['Valor'];
        parsedCsv.push(data);
    })
    .on("end", function () {
        parsedCsv.sort((a, b) => b['Valor'] >= a['Valor'] ? 1 : -1);
        csv.writeToPath(
            dest, parsedCsv.slice(1), {headers: true}
        )
        .on("finish", function(){
            console.log(colors.green.bold(`parsed csv saved to ${dest}`));
        });
    });
