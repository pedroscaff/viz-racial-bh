import './bootstrap/css/bootstrap.css';
import './DropdownSelect.css';
import React from 'react';
import ClassNames from 'classnames';

const PROP_TYPES = {
    select: React.PropTypes.string,
    values: React.PropTypes.object.isRequired,
    onSelectChange: React.PropTypes.function
};

const DEFAULT_PROPS = {
    select: '',
    onSelectChange: (key) => {console.log(`clicked key was ${key}`)}
};

class DropdownSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedLabel: this.props.select,
            visible: false
        };
    }
    static get defaultProps() {
        return DEFAULT_PROPS;
    }
    static get propTypes() {
        return PROP_TYPES;
    }
    onOpenClick() {
        this.setState({visible: !this.state.visible});
    }
    onSelectClick(key) {
        this.setState({
            visible: false,
            selectedLabel: this.props.values[key]
        });
        this.props.onSelectChange(key);
    }
    render() {
        let classNames = ClassNames({
            dropdown: true,
            open: this.state.visible,
            scaffDropdownSelect: true,
        });
        return (
            <div className={classNames} onClick={this.onOpenClick.bind(this)}>
                <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded={this.state.visible}>
                {this.state.selectedLabel}
                    <span style={{marginLeft: "5px"}} className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                {Object.keys(this.props.values).map(key =>
                    <li key={key} onClick={this.onSelectClick.bind(this, key)}>
                        <a href="#">{this.props.values[key]}</a>
                    </li>
                )}
                </ul>
            </div>
        );
    }
}

export default DropdownSelect;
