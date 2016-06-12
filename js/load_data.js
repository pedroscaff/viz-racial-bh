'use strict';

let dados_candidatos;
function save_data_cand (d) {
    dados_candidatos = d;
    d3.csv('../dados/bens/bem_candidato_2014_MG.csv', (d) => {
        d['valor_bem'] = +d['valor_bem'];
        return d;
    }, save_data_bens);
}

let bens_candidatos;
function save_data_bens (d) {
    bens_candidatos = d;
    d3.csv('../dados/bens/bem_candidato_2010_MG.csv', (d) => {
        d['valor_bem'] = +d['valor_bem'];
        return d;
    }, save_data_bens_2010);
}

let bens_candidatos_2010;
function save_data_bens_2010 (d) {
    bens_candidatos_2010 = d;
    draw(dados_candidatos, bens_candidatos, bens_candidatos_2010);
}

d3.csv('../dados/consulta_cand_2014_MG.csv', (d) => {
    d['cod_sit_tot_turno'] = +d['cod_sit_tot_turno'];
    return d;
}, save_data_cand);
