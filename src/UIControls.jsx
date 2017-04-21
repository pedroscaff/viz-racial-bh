import './bootstrap/css/bootstrap.css';
import './ui.css';
import React from 'react';

import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Legend from './Legend.jsx';

const PROP_TYPES = {
    title: React.PropTypes.string,
    defaultLabel: React.PropTypes.string,
    selectLabels: React.PropTypes.array,
    onSelectChange: React.PropTypes.func,
    legendLabels: React.PropTypes.array,
    scale: React.PropTypes.func
};

const DEFAULT_PROPS = {
    title: '',
    defaultLabel: '',
    onSelectChange: (key) => {console.log(`clicked key was ${key}`)}
};

class UIControls extends React.Component {
    static get getDefaultProps() {
        return DEFAULT_PROPS;
    }
    static get propTypes() {
        return PROP_TYPES;
    }
    constructor(props) {
        super(props);
        this.state = {
            value: 'Show Majority',
            categories: this.props.legendLabels,
            scale: this.props.scale
        };
    }
    _onSelectChange(selected) {
        if (selected) {
            this.setState({
                value: selected.value
            });
            let legendParams = this.props.onSelectChange(selected.value);
            this.setState({
                scale: legendParams.scale,
                categories: legendParams.categories
            });
        } else {
            this.setState({value: ''});
            this.props.onSelectChange('clear');
        }
    }
    componentDidMount() {
        this.setState({value: 'all'});
    }
    render() {
        return (
            <div className='ui-controls'>
                <h4 className='ui-controls-title'> {this.props.title} </h4>
                <Select
                    options={this.props.selectLabels}
                    onChange={this._onSelectChange.bind(this)}
                    name='Select-dropdown'
                    value={this.state.value}
                    placeholder='Select visualization'
                />
                <Legend
                    scale={this.state.scale}
                    categories={this.state.categories}
                />
            </div>
        );
    }
}

export default UIControls;
