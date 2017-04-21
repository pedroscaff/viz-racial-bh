import './bootstrap/css/bootstrap.css';
import './Legend.css';
import React from 'react';

const CATEGORICAL_PROP_TYPES = {
    categories: React.PropTypes.array,
    scale: React.PropTypes.func
};

const LINEAR_PROP_TYPES = {
    scale: React.PropTypes.func
};

class Rect extends React.Component {
    static get propTypes() {
        return {
            x: React.PropTypes.number,
            y: React.PropTypes.number,
            width: React.PropTypes.number,
            height: React.PropTypes.number,
            style: React.PropTypes.object
        };
    }
    render() {
        return (
            <rect height={this.props.height} width={this.props.width}
                x={this.props.x} y={this.props.y}
                style={this.props.style}
            />
        );
    }
}

class LinearLegend extends React.Component {
    static get propTypes() {
        return LINEAR_PROP_TYPES;
    }
    render() {
        let values = [];
        const width = 190/10;
        for (let i=0; i<10; i++) {
            values.push({
                x: i * width,
                y: 1,
                width: width,
                height: 20,
                style: {
                    fill: this.props.scale(i/10)
                }
            });
        }
        return (
            <svg className='legendItem'>
                {values.map((value, i) =>
                    <Rect
                        key={i}
                        x={value.x}
                        y={value.y}
                        width={value.width}
                        height={value.height}
                        style={value.style}
                    />
                )}
                <text x={0} y={30}>low</text>
                <text x={(values.length-1)*width} y={30}>high</text>
            </svg>
        );
    }
}

class CategoricalLegend extends React.Component {
    static get propTypes() {
        return CATEGORICAL_PROP_TYPES;
    }
    constructor(props) {
        super(props);
        this.rectWidth = Math.floor(190/this.props.categories.length);
    }
    render() {
        return (
            <svg>
                {this.props.categories.map((category, i) =>
                    <g key={category} className='legendItem'>
                        <Rect
                            x={i * this.rectWidth}
                            y={1}
                            width={this.rectWidth}
                            height={20}
                            style={{fill: this.props.scale(category)}}
                        />
                        <text x={i * this.rectWidth} y={30}>
                            {category}
                        </text>
                    </g>
                )}
            </svg>
        );
    }
}

class Legend extends React.Component {
    static get propTypes() {
        return CATEGORICAL_PROP_TYPES;
    }
    constructor(props) {
        super(props);
        this.state = {
            categories: this.props.categories,
            scale: this.props.scale
        };
    }
    render() {
        if (this.props.categories) {
            return (
                <CategoricalLegend
                    scale={this.props.scale}
                    categories={this.props.categories}
                />
            );
        } else {
            return (
                <LinearLegend
                    scale={this.props.scale}
                />
            );
        }
    }
}

export {CategoricalLegend};
export {LinearLegend};
export default Legend;
