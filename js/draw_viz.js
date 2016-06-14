'use strict';

let draw = (dados_candidatos, bens_candidatos) => {
    let margin = 75,
        width = 1400 - margin,
        height = 600 - margin;

    let svg = d3.select('body')
        .append('svg')
            .attr('width', width + margin)
            .attr('height', height + margin);
    let group1 = svg.append('g').attr('class', 'chart');
    let group2 = svg.append('g').attr('class', 'chart');

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
            'total_bens': sum.toFixed(0),
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
        b.values['total_candidatos_eleitos'] -
        a.values['total_candidatos_eleitos']
    );



    let scale_percent = d3.scale.pow().exponent(0.5)
        .range([1400 - margin, 700])
        .domain([0, 1]);

    let scale_eleitos = d3.scale.pow().exponent(0.5)
        .range([70, 700])
        .domain([0, d3.max(nested_parties.slice(0, 10), (d) =>
            d.values['total_candidatos_eleitos'])
        ]);

    let scale_y = d3.scale.linear()
        .range([50, 700])
        .domain([0, 11]);

    function handleInterruption () {

    }

    function mouseOverEvent () {
        let id = 'mouse-line' + this.getAttribute('id');
        group1.selectAll('*').interrupt(id)
            .selectAll('*').interrupt(id);
        let x = Number(this.getAttribute('width')) +
                Number(this.getAttribute('x'));
        console.log(x);
        group1.append('line')
            .attr('id', id)
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', Number(this.getAttribute('y')) + 20)
            .attr('y2', Number(this.getAttribute('y')) + 20)
            .attr('stroke-width', 2)
            .attr('style', 'stroke: black')
            .style('stroke-dasharray', ('3, 3'))
            .transition(id)
            .duration(500)
            .attr('y2', 700);
    }

    function mouseOutEvent () {
        let id = 'mouse-line' + this.getAttribute('id');
        group1.selectAll('*').interrupt(id)
            .selectAll('*').interrupt(id);
        group1.selectAll('#' + id)
            .transition()
            .each('end', () => {
                group1.selectAll('#' + id)
                    .remove();
            })
            .duration(250)
            .attr('y2', Number(this.getAttribute('y')) + 20);
    }

    let total_lines = group1.selectAll('rect')
        .data(nested_parties.slice(0, 10))
        .enter()
        .append('rect')
            .attr('x', 70)
            .attr('y', (d, i) => scale_y(i) - 20)
            .attr('width', (d) =>
                scale_eleitos(d.values['total_candidatos_eleitos'])
            )
            .style('fill', 'blue')
            .attr('height', 30)
            .attr('id', (d, i) => 'rect-' + i);

    total_lines.on('mouseover', mouseOverEvent);
    total_lines.on('mouseout', mouseOutEvent);

    group1.selectAll('text')
        .data(nested_parties.slice(0, 10))
        .enter()
        .append('text')
        .attr('x', (d) => 0)
        .attr('y', (d, i) => scale_y(i))
        .text((d) => d['key']);

    function ratio_eleitos (party) {
        let ratio =
            party['total_candidatos_eleitos'] / party['total_candidatos'];
        return scale_percent(ratio.toFixed(2));
    }

    group2.selectAll('line')
        .data(nested_parties.slice(0, 10))
        .enter()
        .append('line')
        .attr('stroke-width', 2)
        .attr('x1', 1400 - margin)
        .attr('x2', (d) => ratio_eleitos(d.values))
        .attr('y1', (d, i) => scale_y(i))
        .attr('y2', (d, i) => scale_y(i))
        .attr('style', 'stroke: black');


    // setTimeout(() => {
    //     svg.selectAll('line')
    //         // .enter()
    //         .transition()
    //         .duration(500)
    //         .attr('x2', (d) => line_scale(d['total_bens']));
    // }, 2000);

}
