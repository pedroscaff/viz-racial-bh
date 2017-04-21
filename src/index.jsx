import './index.css';
import 'whatwg-fetch';
import {app_id, app_code} from '../datalens.json';
import {dsvFormat} from 'd3-dsv';
import {scaleLinear} from 'd3-scale';
// import {scalePow} from 'd3-scale';
import {scaleOrdinal} from 'd3-scale';
// import {extent} from 'd3-array';
import UIControls from './UIControls.jsx';
import ReactDOM from 'react-dom';
import React from 'react';

// initialize communication with the platform
const platform = new H.service.Platform({
    app_id,
    app_code,
    useCIT: true,
    useHTTPS: true
});

// initialize a map
let pixelRatio = devicePixelRatio > 1 ? 2 : 1;
let defaultLayers = platform.createDefaultLayers({
    tileSize: 256 * pixelRatio
});

let map = new H.Map(
    document.getElementsByClassName('dl-map')[0],
    defaultLayers.normal.xbase,
    {
        pixelRatio,
        center: new H.geo.Point(-19.91946, -43.94274),
        zoom: 13
    }
);

window.addEventListener('resize', function() {
    map.getViewPort().resize();
});

//make the map interactive
new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
H.ui.UI.createDefault(map, defaultLayers);

//create providers
// let service = platform.configure(new H.datalens.Service());
let spatialProvider = new H.datalens.RawDataProvider({
    dataUrl: './fixtures/bh_setores_censitarios.json'
});

function addLayer(data) {
    let majorityDomain = ['V002', 'V003', 'V004', 'V005', 'V006'];
    let majorityColors = ['#f7f6ea', '#424139',
        '#e9f720', '#d88b20', '#e8121d'];
    let majorityScale = scaleOrdinal()
        .domain(majorityDomain)
        .range(majorityColors);

    let singleColors = ['#1BD3E0', '#9D1AE0'];

    function majorityFillColor(id) {
        let idx = data.findIndex(entry => {
            return entry['Cod_setor'] === id;
        });
        if (idx !== -1) {
            let max = 0;
            let colorCode;
            for (let i = 2; i < 7; i++) {
                if (data[idx][`V00${i}`] > max) {
                    max = data[idx][`V00${i}`];
                    colorCode = `V00${i}`;
                }
            }
            return majorityScale(colorCode);
        } else {
            return null;
        }
    }

    //create a spatial layer
    let majorityLayer = new H.datalens.SpatialLayer(
        null,
        spatialProvider,
        {
            opacity: 0.8,
            pixelRatio: window.devicePixelRatio,
            featureToSpatialId: (feature) => {
                return feature.properties['CD_GEOCODI'];
            },
            rowToStyle: (featureProps) => {
                return {
                    fillColor: majorityFillColor(featureProps['CD_GEOCODI'])
                };
            },
            defaultStyle: () => {
                return {
                    opacity: 0.0
                };
            }
        }
    );
    map.addLayer(majorityLayer);

    function singleFillColor(scale, key, id) {
        let idx = data.findIndex(entry => {
            return entry['Cod_setor'] === id;
        });
        if (idx !== -1) {
            let value = Number.parseInt(data[idx][key]);
            if (!Number.isNaN(value)) {
                let percentage = value/Number.parseInt(data[idx]['V001']);
                return scale(percentage);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    let singleLayer;
    function addSingleLayer(fillColor) {
        singleLayer = new H.datalens.SpatialLayer(
            null,
            spatialProvider,
            {
                opacity: 0.8,
                pixelRatio: window.devicePixelRatio,
                featureToSpatialId: (feature) => {
                    return feature.properties['CD_GEOCODI'];
                },
                rowToStyle: (featureProps) => {
                    return {
                        fillColor: fillColor(featureProps['CD_GEOCODI'])
                    };
                },
                defaultStyle: () => {
                    return {
                        opacity: 0.0
                    };
                }
            }
        );
        map.addLayer(singleLayer);
    }

    // create panel
    let legendLabels = [
        'white',
        'black',
        'yellow',
        'brown',
        'indigenous'
    ];
    let selectLabels = [
        {value: 'all', label: 'Show Majority'},
        {value: 'V002', label: 'white'},
        {value: 'V003', label: 'black'},
        {value: 'V004', label: 'yellow'},
        {value: 'V005', label: 'brown'},
        {value: 'V006', label: 'indigenous'}
    ];
    let uiControls = <UIControls
        title = 'Belo Horizonte'
        defaultLabel = {selectLabels[0].label}
        selectLabels = {selectLabels}
        onSelectChange = {updateLayers}
        legendLabels = {legendLabels}
        scale = {majorityScale}
    />;

    ReactDOM.render(
        uiControls,
        document.getElementById('root')
    );

    /**
     * update layers
     * @returns {Object} - new labels for the legend, used by uiControls component
     */
    function updateLayers(key) {
        let categories, scale;
        let currentLayers = map.getLayers();
        if (key === 'all') {
            if (currentLayers.indexOf(majorityLayer) === -1) {
                map.removeLayer(singleLayer);
                map.addLayer(majorityLayer);
            }
            categories = legendLabels;
            scale = majorityScale;
        } else if (key === 'clear') {
            map.removeLayer(singleLayer);
            map.removeLayer(majorityLayer);
            return;
        } else {
            if (currentLayers.indexOf(singleLayer) === -1) {
                map.removeLayer(majorityLayer);
            } else {
                map.removeLayer(singleLayer);
            }
            // let domain = extent(data, entry => {
            //     let value = Number.parseInt(entry[key]);
            //     if (!Number.isNaN(value)) {
            //         return Math.sqrt(value);
            //     } else {
            //         return 0;
            //     }
            // });
            // let scale = scalePow(0.5).domain(domain).range(singleColors);
            scale = scaleLinear([0, 1]).range(singleColors);
            addSingleLayer(singleFillColor.bind(null, scale, key));
        }
        return {categories: categories, scale: scale};
    }

    // let hoveredObject;
    // map.addEventListener('pointermedObject !== e.target) {
    //         infoBubble.close();
    //     }
    //
    //     hoveredObject = e.target;
    //     if (hoveredObject instanceof H.datalens.SpatialLayer.Spatial) {
    //         let featureProps = hoveredObject.getData();
    //         let id = featureProps['NM_BAIRRO'];
    //         if (featureProps) {
    //             let region = featureProps['NM_BAIRRO'];
    //             let idx = data.findIndex(entry => {
    //                 return entry['Nome_do_bairro'] === id;
    //             })
    //             if (idx !== -1) {
    //                 let variance = data[idx]['V005'];
    //                 if (variance > 1e12) {
    //                     variance = `${format(variance/1e12)} Trillion`;
    //                 } else {
    //                     variance = `${format(variance/1e9)} Billion`;
    //                 }
    //
    //                 let pos = map.screenToGeo(
    //                     e.currentPointer.viewportX, e.currentPointer.viewportY);
    //                     infoBubble.setPosition(pos);
    //                     infoBubble.setContent(`<div class="gdp-info-bubble-title">${region}</div><div class="gdp-info-bubble-label">${variance}</div>`);
    //                     infoBubble.open();
    //             }
    //         }
    //     }
    // });
}

fetch('./fixtures/Pessoa03_MG.csv')
    .then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new Error('could not load data file');
    })
    .then(body => {
        addLayer(dsvFormat(';').parse(body));
    });
