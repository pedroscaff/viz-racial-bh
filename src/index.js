import {app_id, app_code} from '../datalens.json';
import {dsvFormat} from 'd3-dsv';
import {scaleLinear} from 'd3-scale';
import {scalePow} from 'd3-scale';
import {scaleOrdinal} from 'd3-scale';
import {extent} from 'd3-array';
import Panel from 'datalens-ui/Panel';
import Label from 'datalens-ui/Label';
import ColorLegend from 'datalens-ui/ColorLegend';
import Select from 'datalens-ui/Select';

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
let ui = H.ui.UI.createDefault(map, defaultLayers);

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

    let singleColors = ['#1BD3E0', '#1BA4EA', '#1E63D3', '#6320E0', '#9D1AE0'];

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
                    fillColor: 'gray'
                };
            }
        }
    );
    map.addLayer(majorityLayer);

    function singleFillColor(scale, id) {
        let idx = data.findIndex(entry => {
            return entry['Cod_setor'] === id;
        });
        if (idx !== -1) {
            let column = select.getValue();
            let value = Number.parseInt(data[idx][column]);
            if (!Number.isNaN(value)) {
                return scale(value);
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
                        fillColor: 'gray'
                    };
                }
            }
        );
        map.addLayer(singleLayer);
    }

    // create panel
    const panel = new Panel('Belo Horizonte Data');
    const censusLabel = new Label();
    let legendLabels = {
        '0': 'white',
        '1': 'black',
        '2': 'yellow',
        '3': 'brown',
        '4': 'indigenous'
    };
    const majorityLegend = new ColorLegend(
        v => majorityColors[Math.floor(v * 5)]
    );
    const singleLegend = new ColorLegend(
        scaleLinear().range([singleColors[0], singleColors[4]]));
    const select = new Select({
        'all': 'Show majority',
        'V002': 'white',
        'V003': 'black',
        'V004': 'yellow',
        'V005': 'brown',
        'V006': 'indigenous'
    });
    ui.addControl('panel', panel);
    panel.addChild(censusLabel);
    censusLabel.setHTML('Some census data');
    panel.addChild(select);
    panel.addChild(majorityLegend);
    let majorityLabels = Object.keys(legendLabels).map(
        key => legendLabels[key]);
    majorityLegend.setLabels(majorityLabels);

    let infoBubble = new H.ui.InfoBubble({lat: 0, lng: 0}, {});
    infoBubble.addClass('gdp-info-bubble');
    infoBubble.close();
    ui.addBubble(infoBubble);

    function updateLayers() {
        let currentLayers = map.getLayers();
        let selectedValue = select.getValue();
        if (selectedValue === 'all') {
            if (currentLayers.indexOf(majorityLayer) === -1) {
                map.removeLayer(singleLayer);
                panel.removeChild(singleLegend);
                panel.addChild(majorityLegend);
                map.addLayer(majorityLayer);
                majorityLegend.setLabels(majorityLabels);
            }
        } else {
            if (currentLayers.indexOf(singleLayer) === -1) {
                map.removeLayer(majorityLayer);
                panel.removeChild(majorityLegend);
                panel.addChild(singleLegend);
                singleLegend.setLabels(['low', 'high']);
            } else {
                map.removeLayer(singleLayer);
            }
            let domain = extent(data, entry => {
                let value = Number.parseInt(entry[selectedValue]);
                if (!Number.isNaN(value)) {
                    return Math.sqrt(value);
                } else {
                    return 0;
                }
            });
            let scale = scalePow(0.5).domain(domain).range(singleColors);
            addSingleLayer(singleFillColor.bind(null, scale));
        }
    }

    select.addEventListener('change', updateLayers);

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

let xhr = new XMLHttpRequest();
xhr.addEventListener('load', function () {
    if (this.readyState === XMLHttpRequest.DONE) {
        addLayer(dsvFormat(';').parse(this.responseText));
    }
});
xhr.open('GET', './fixtures/Pessoa03_MG.csv');
xhr.send(null);
