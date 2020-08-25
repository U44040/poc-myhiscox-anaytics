import React, { Component } from 'react';
import Select, {components} from 'react-select';
import Option from '../Option/Option';

class FilterSelector extends Component
{

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
        if (this.props.inputValue !== "") {
            className.push(props.selectProps.classNamePrefix + "__group-wrapper--is-searching")
        }
        return (
            <div className={className.join(" ")}>
                <components.Group {...props} />
            </div>
        );
    }

    OptionComponent = props => (
        <Option key={props.value} specialFilterValues={this.props.specialFilterValues} addSpecialFilterValue={this.props.addSpecialFilterValue} removeSpecialFilterValue={this.props.removeSpecialFilterValue} {...props}></Option>
    );

    components = {
        DropdownIndicator: null,
        GroupHeading: this.CustomGroupHeading,
        Option: this.OptionComponent,
        Group: this.GroupComponent,
    }


    render = () => (
        <Select
            isMulti
            //key={JSON.stringify(this.state.options)}
            name="filters"
            menuIsOpen={true}
            hideSelectedOptions={false}
            className="react-select-container-filters"
            classNamePrefix="react-select-filters"
            options={this.props.options}
            components={this.components}
            value={this.props.filterValue}
            inputValue={this.props.inputValue}
            onChange={this.props.filterChange}
            onInputChange={this.props.changeSearchValue}
            maxMenuHeight={500}
        />
    )

}

export default FilterSelector;