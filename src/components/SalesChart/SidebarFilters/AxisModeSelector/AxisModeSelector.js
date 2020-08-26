import React, {Component} from 'react';
import Select, {components} from 'react-select';
import Option from '../../../Shared/Option/Option';

class AxisModeSelector extends Component
{

    constructor (props) {
        super();

        let options = [
            { label: "X-AXIS", options: [
                { label: 'Time', value: "X1", type: 'X-AXIS' },
                { label: 'Products in Market', value: "X2", type: 'X-AXIS' },
            ]},
            { label: "Y-AXIS", options: [
                { label: 'Time', value: "Y1", type: 'Y-AXIS' },
                { label: 'Products in Market', value: "Y2", type: 'Y-AXIS' },
            ]},
        ];

        this.state = {
            options,
            inputValue: '',
            value: [
                { label: 'Time', value: "X1", type: 'X-AXIS' },
                { label: 'Products in Market', value: "Y2", type: 'Y-AXIS' },
            ]
        }
    }

    handleHeaderClick = id => {
        const node = document.querySelector(`#${id}`).parentElement.parentElement;
        const classes = node.classList;
        if (classes.contains("group-expanded")) {
            node.classList.remove("group-expanded");
        } else {
            node.classList.add("group-expanded");
        }
    };

    CustomGroupHeading = props => {
        return (
            <div
                className="group-heading-wrapper"
                onClick={() => this.handleHeaderClick(props.id)}
            >
                <components.GroupHeading {...props} />
            </div>
        );
    };

    GroupComponent = props => {
        let className = [props.selectProps.classNamePrefix + "__group-wrapper"];
        if (this.state.inputValue !== "") {
            className.push(props.selectProps.classNamePrefix + "__group-wrapper--is-searching")
        }
        return (
            <div className={className.join(" ")}>
                <components.Group {...props} />
            </div>
        );
    }

    OptionComponent = props => (
        <Option key={props.value} {...props}></Option>
    );

    ControlComponent = props => (
        <div></div>
    )

    components = {
        Control: this.ControlComponent,
        DropdownIndicator: null,
        GroupHeading: this.CustomGroupHeading,
        Option: this.OptionComponent,
        Group: this.GroupComponent,
    }

    modeChange = (values) => {
        let xValue = this.state.value[0], yValue = this.state.value[1];
        for (let value of values) {
            if (value.type === "X-AXIS") { xValue = value; }
            if (value.type === "Y-AXIS") { yValue = value; }
        }
        this.setState({
            value: [
                xValue,
                yValue,
            ]
        })
    }

    render = () => (
        <Select
        isMulti
        //key={JSON.stringify(this.state.options)}
        name="axisMode"
        menuIsOpen={true}
        hideSelectedOptions={false}
        className="react-select-container-filters"
        classNamePrefix="react-select-filters"
        options={this.state.options}
        components={this.components}
        value={this.state.value}
        onChange={this.modeChange}
        maxMenuHeight={500}
    />
    );
    
}

export default AxisModeSelector;