'use strict';

let draw = (dados_candidatos, bens_candidatos) => {
    let margin = 75,
        width = 1400 - margin,
        height = 600 - margin;

    let svg = d3.select('body')
        .append('svg')
            .attr('width', width + margin)
            .attr('height', height + margin)
        .append('g')
            .attr('class', 'chart');

    function get_total_bens (key) {
        let sum = d3.sum(bens_candidatos, (d) => {
            if (d['sq_candidato'] === key) {
                return d['valor_bem'];
            } else {
                return 0;
            }
        });
        return sum;
    }

    let nested_candidatos = d3.nest()
        .key((d) => d['sq_candidato'])
        .entries(dados_candidatos);

    function filter_eleitos (d, eleitos) {
        if (d.values[0]['cod_sit_tot_turno'] >= 1 &&
            d.values[0]['cod_sit_tot_turno'] <= 3) {
            return eleitos;
        } else {
            return !eleitos;
        }
    }

    function filter_eleitos_party (d, eleitos) {
        if (d['cod_sit_tot_turno'] >= 1 && d['cod_sit_tot_turno'] <= 3) {
            return eleitos;
        } else {
            return !eleitos;
        }
    }

    function get_total_bens_party (leaves) {
        let sum = 0;
        leaves.forEach((d) => {
            sum += get_total_bens(d['sq_candidato']);
        });
        let cand_eleitos = leaves.filter((d) => filter_eleitos_party(d, true));
        return {
            'total_bens': sum,
            'total_candidatos': leaves.length,
            'total_candidatos_eleitos': cand_eleitos.length
        }
    }

    let nested_parties = d3.nest()
        .key((d) => d['sigla_partido'])
        .rollup(get_total_bens_party)
        .entries(dados_candidatos);

    let candidatos_eleitos = nested_candidatos.filter(
        (d) => filter_eleitos(d, true)
    );

    candidatos_eleitos.forEach((d) => {
        d.total_bens = get_total_bens(d['key']);
    });

    candidatos_eleitos.sort(
        (a, b) => b['total_bens'] - a['total_bens']
    );

    nested_parties.sort((a, b) =>
        b.values['total_candidatos_eleitos'] - a.values['total_candidatos_eleitos']
    );

    let line_scale = d3.scale.pow().exponent(0.5)
        .range([50, 700])
        .domain(d3.extent(nested_parties, (d) => d.values['total_bens']));

    let line_scale2 = d3.scale.pow().exponent(0.5)
        .range([50, 700])
        .domain(d3.extent(
            nested_parties, (d) => d.values['total_candidatos_eleitos']
        ));

    let line_y = d3.scale.linear()
        .range([50, 700])
        .domain([0, 11]);

    svg.selectAll('line')
        .data(nested_parties.slice(0, 10))
        .enter()
        .append('line')
        .attr('stroke-width', 2)
        .attr('x1', 70)
        .attr('x2', (d) => line_scale2(d.values['total_candidatos_eleitos']))
        .attr('y1', (d, i) => line_y(i))
        .attr('y2', (d, i) => line_y(i))
        .attr('style', 'stroke: black')
        .attr('id', (d, i) => 'line-' + i);

    svg.selectAll('text')
        .data(nested_parties.slice(0, 10))
        .enter()
        .append('text')
        // .attr('x', (d) => line_scale2(d.values['total_candidatos_eleitos']) + 20)
        .attr('x', (d) => 0)
        .attr('y', (d, i) => line_y(i))
        .text((d) => d['key'] + ' - ' + d.values['total_candidatos_eleitos'].toFixed(2));

    // setTimeout(() => {
    //     svg.selectAll('line')
    //         // .enter()
    //         .transition()
    //         .duration(500)
    //         .attr('x2', (d) => line_scale(d['total_bens']));
    // }, 2000);

}
