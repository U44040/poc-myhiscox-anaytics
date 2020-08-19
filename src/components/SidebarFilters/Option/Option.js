import React, { Component } from 'react';
import * as FILTER_TYPES from '../FilterTypes';
import { components } from 'react-select';


class Option extends Component {

    concatTypeValue = (type, value) => (type + "_" + value);

    constructor(props) {
        super();
        this.classNamePrefix = props.selectProps.classNamePrefix + "__option-wrapper";

        let disabled = false;
        let canBeDisabled = false;
        if (props.value == this.concatTypeValue(FILTER_TYPES.STATUS, 'Approved') || props.value == this.concatTypeValue(FILTER_TYPES.STATUS, 'Rejected')) {
            disabled = true;
            canBeDisabled = true;
        }

        this.state = {
            disabled,
            canBeDisabled,
        };
    }

    clickHandler = (e) => {
        if (this.state.disabled) {
            this.props.addSpecialFilterValue(this.props.value);
            this.setState({
                disabled: false,
            })
        }
    }

    contextMenuHandler = (e) => {
        e.preventDefault();
        if (this.state.canBeDisabled && this.props.isSelected == false) {
            this.props.removeSpecialFilterValue(this.props.value);
            this.setState({
                disabled: true,
            })
        }
    }

    render = () => {
        let classes = [this.classNamePrefix];
        let option;
        
        if (this.state.disabled) {
            classes.push(this.classNamePrefix + "--disabled");
            option = (
                <div class="react-select-filters__option css-yt9ioa-option">
                    <input type="checkbox" readonly="" disabled />
                    <label>{this.props.label}</label>
                </div>
            );
        }
        else
        {
            option = (
                <components.Option {...this.props}>
                    <input type="checkbox" checked={this.props.isSelected} readOnly />
                    <label>{this.props.label}</label>
                </components.Option>
            );
        }

        return (
            <div className={classes.join(" ")} onClick={this.clickHandler} onContextMenu={this.contextMenuHandler} >
                { option }
            </div>
        )
    }

}

export default Option;