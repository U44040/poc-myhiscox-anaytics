import React, { Component } from 'react';
import './SidebarFilters.scss';
import Select, { components } from 'react-select';
import rfdc from 'rfdc';
import * as FILTER_TYPES from './FilterTypes';
import * as STATUS from '../../utils/StatusTypes';
import Option from './Option/Option';
import ListGroupItem from './ListGroupItem/ListGroupItem';
import AxisModeSelector from './AxisModeSelector/AxisModeSelector';
import userContext from '../../context/userContext';
import * as ROLES from '../../utils/RoleTypes';

const deepClone = rfdc();

class SidebarFilters extends Component {

    /** 
     * @TODO: Split component in sidebar, filters and settings 
     * **/

    constructor(props) {
        super();
        this.state = {
            collapsed: props.collapsed,
            sidebarFixed: props.sidebarFixed,
            filterValue: [
                /*{
                    label: "Hide Issued",
                    value: "HIDE_ISSUED",
                    type: FILTER_TYPES.STATUS,
                }*/
            ],
            specialFilterValues: [],
            inputValue: '',
            axisMode: 1,
        }
    }

    static contextType = userContext;

    componentDidUpdate = (prevProps) => {
        if (prevProps.salesChartData !== this.props.salesChartData) {
            this.prepareFilters();
        }
    }

    concatTypeValue = (type, value) => (type + "_" + value);

    prepareFilters = () => {
        let statusOptions = [];
        let brokerOptions = {};
        let brokerageOptions = {};
        let networkOptions = {};
        let sourceOptions = {};
        let productOptions = {};

        for (let status of this.getFilteredData()) {

            if (Array.isArray(status.projects) && status.projects.length === 0) {
                continue;
            }

            if (status.status != STATUS.APPROVED && status.status != STATUS.REJECTED) {
                statusOptions.push({
                    label: status.status,
                    value: this.concatTypeValue(FILTER_TYPES.STATUS, status.status),
                    type: FILTER_TYPES.STATUS,
                });
            }

            for (let project of status.projects) {
                brokerOptions[project.user.id] = {
                    label: project.user.name,
                    value: this.concatTypeValue(FILTER_TYPES.BROKER, project.user.id),
                    type: FILTER_TYPES.BROKER,
                };

                brokerageOptions[project.user.brokerage.id] = {
                    label: project.user.brokerage.name,
                    value: this.concatTypeValue(FILTER_TYPES.BROKERAGE, project.user.brokerage.id),
                    type: FILTER_TYPES.BROKERAGE,
                };

                networkOptions[project.user.brokerage.network.id] = {
                    label: project.user.brokerage.network.name,
                    value: this.concatTypeValue(FILTER_TYPES.NETWORK, project.user.brokerage.network.id),
                    type: FILTER_TYPES.NETWORK,
                };

                sourceOptions[project.source] = {
                    label: project.source,
                    value: this.concatTypeValue(FILTER_TYPES.SOURCE, project.source),
                    type: FILTER_TYPES.SOURCE,
                };

                for (let productVariant of project.productVariants) {
                    productOptions[productVariant.idProductVariant] = {
                        label: productVariant.name,
                        value: this.concatTypeValue(FILTER_TYPES.PRODUCT, productVariant.idProductVariant),
                        type: FILTER_TYPES.PRODUCT,
                    }
                }
            }
        }

        statusOptions = statusOptions.sort(this.compareLabels);

        statusOptions.push({
            label: STATUS.APPROVED,
            value: this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.APPROVED),
            type: FILTER_TYPES.STATUS,
        });
        statusOptions.push({
            label: STATUS.REJECTED,
            value: this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.REJECTED),
            type: FILTER_TYPES.STATUS,
        });

        brokerOptions = Object.values(brokerOptions).sort(this.compareLabels);
        brokerageOptions = Object.values(brokerageOptions).sort(this.compareLabels);
        networkOptions = Object.values(networkOptions).sort(this.compareLabels);
        sourceOptions = Object.values(sourceOptions).sort(this.compareLabels);
        productOptions = Object.values(productOptions);

        if (this.context && this.context.user) {
            let user = this.context.user;
            switch (user.role) {
                case ROLES.NETWORK_MANAGER_ROLE:
                    networkOptions = [];
                    break;

                case ROLES.BROKERAGE_MANAGER_ROLE:
                    networkOptions = [];
                    brokerageOptions = [];
                    break;

                case ROLES.USER_ROLE:
                    networkOptions = [];
                    brokerageOptions = [];
                    brokerOptions = [];
                    break;
            }
        }

        const options = [
            { label: "Brokers", options: brokerOptions },
            { label: "Brokerages", options: brokerageOptions },
            { label: "Networks", options: networkOptions },
            { label: "Products", options: productOptions },
            { label: "Status", options: statusOptions },
            { label: "Source", options: sourceOptions },
        ];

        this.setState({
            options
        })
    }

    compareLabels = (a, b) => a.label.localeCompare(b.label);

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
        <Option key={props.value} specialFilterValues={this.state.specialFilterValues} addSpecialFilterValue={this.addSpecialFilterValue} removeSpecialFilterValue={this.removeSpecialFilterValue} {...props}></Option>
    );

    components = {
        DropdownIndicator: null,
        GroupHeading: this.CustomGroupHeading,
        Option: this.OptionComponent,
        Group: this.GroupComponent,
    }

    showSidebar = (e) => {
        this.setState({
            collapsed: false,
        })
    }

    hideSidebar = (e) => {
        if (this.state.sidebarFixed === true) { return; }
        this.setState({
            collapsed: true,
        })
    }

    toggleSidebarFixed = (e) => {
        this.setState((oldState, oldProps) => ({
            sidebarFixed: !oldState.sidebarFixed
        }))
    }

    filterChange = (values) => {
        let filtersByType = this.getFiltersByType(values);
        this.setState({
            filterValue: values
        }, () => this.props.updateFilters(filtersByType));
    }

    getFiltersByType = (values) => {
        let filtersByType = {};
        if (Array.isArray(values)) {
            for (let filter of values) {
                if (filtersByType[filter.type] == undefined) {
                    filtersByType[filter.type] = [];
                }
                filtersByType[filter.type].push(filter);
            }
        }
        return filtersByType;
    }

    getFilteredData = () => {
        let data = deepClone(this.props.salesChartData);
        let filtersByType = this.getFiltersByType(this.state.filterValue);
        for (let filterType in filtersByType) {
            let filters = filtersByType[filterType].map(d => d.value);

            switch (filterType) {
                case FILTER_TYPES.BROKER:
                    for (let status of data) {
                        status.projects = status.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.BROKER, d.user.id)));
                    }
                    break;

                case FILTER_TYPES.BROKERAGE:
                    for (let status of data) {
                        status.projects = status.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.BROKERAGE, d.user.brokerage.id)));
                    }
                    break;

                case FILTER_TYPES.NETWORK:
                    for (let status of data) {
                        status.projects = status.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.NETWORK, d.user.brokerage.network.id)));
                    }
                    break;

            }
        }

        let hasApprovedFilter = false;
        let hasRejectedFilter = false;

        if (filtersByType[FILTER_TYPES.STATUS]) {
            let filters = filtersByType[FILTER_TYPES.STATUS].map(d => d.value);
            if (filters.includes(this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.APPROVED))) {
                hasApprovedFilter = true;
            }
            if (filters.includes(this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.REJECTED))) {
                hasRejectedFilter = true;
            }
        }

        for (let status of data) {
            if (status.status == STATUS.APPROVED) {
                if (hasApprovedFilter == false && this.state.specialFilterValues.includes(this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.APPROVED)) == false) {
                    status.projects = [];
                }
            }

            if (status.status == STATUS.REJECTED) {
                if (hasRejectedFilter == false && this.state.specialFilterValues.includes(this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.REJECTED)) == false) {
                    status.projects = [];
                }
            }
        }

        return data;
    }

    addSpecialFilterValue = (value) => {
        let specialFilterValues = this.state.specialFilterValues.map(d => d);
        specialFilterValues.push(value);
        this.setState({
            specialFilterValues
        }, () => this.props.updateSpecialFilters(specialFilterValues));
    }

    removeSpecialFilterValue = (value) => {
        let specialFilterValues = this.state.specialFilterValues.map(d => d);
        let index = specialFilterValues.indexOf(value);
        if (index != -1) {
            specialFilterValues.splice(index, 1);
        }
        this.setState({
            specialFilterValues
        }, () => this.props.updateSpecialFilters(specialFilterValues));
    }

    changeSearchValue = (value) => {
        this.setState({
            inputValue: value
        });
    }

    updateAxisMode = (e) => {
        this.setState({
            axisMode: e.target.value,
        })
    }

    render = () => {
        let classes = ['d-none d-md-block'];
        if (this.state.collapsed) {
            classes.push('sidebar-collapsed');
        }
        else {
            classes.push('sidebar-expanded');
        }

        let iconSidebarFixed;
        if (this.state.sidebarFixed) {
            iconSidebarFixed = 'fa fa-thumb-tack mr-3';
        }
        else {
            iconSidebarFixed = 'fa fa-thumb-tack fa-rotate-90 mr-3';
        }

        return (
            <div id="sidebar-container" className={classes.join(' ')} onMouseEnter={this.showSidebar} onMouseLeave={this.hideSidebar}>
                <ul className="list-group sticky-top sticky-offset sticky-height-control">
                    <li className="sidebar-fixed-button text-right">
                        <span className={iconSidebarFixed} onClick={this.toggleSidebarFixed}></span>
                    </li>

                    <ListGroupItem title="FILTERS" isCollapsable collapsed></ListGroupItem>
                    <div className="list-group-item-content">
                        <Select
                            isMulti
                            //key={JSON.stringify(this.state.options)}
                            name="filters"
                            menuIsOpen={true}
                            hideSelectedOptions={false}
                            className="react-select-container-filters"
                            classNamePrefix="react-select-filters"
                            options={this.state.options}
                            components={this.components}
                            value={this.state.filterValue}
                            inputValue={this.state.inputValue}
                            onChange={this.filterChange}
                            onInputChange={this.changeSearchValue}
                            maxMenuHeight={500}
                        />
                    </div>

                    <ListGroupItem title="AXIS" isCollapsable collapsed></ListGroupItem>
                    <div className="list-group-item-content">
                        <AxisModeSelector />
                    </div>

                    {
                        /*<a href="#submenu1" data-toggle="collapse" aria-expanded="false" className="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                            <div className="d-flex w-100 justify-content-start align-items-center">
                                <span className="fa fa-filter fa-fw mr-3"></span>
                                <span className="menu-collapsed">Corredurías</span>
                                <span className="submenu-icon ml-auto"></span>
                            </div>
                        </a>
                        <a href="#submenu1" data-toggle="collapse" aria-expanded="false" className="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                            <div className="d-flex w-100 justify-content-start align-items-center">
                                <span className="fa fa-dashboard fa-fw mr-3"></span>
                                <span className="menu-collapsed">Redes</span>
                                <span className="submenu-icon ml-auto"></span>
                            </div>
                        </a>
                        <a href="#submenu1" data-toggle="collapse" aria-expanded="false" className="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                            <div className="d-flex w-100 justify-content-start align-items-center">
                                <span className="fa fa-dashboard fa-fw mr-3"></span>
                                <span className="menu-collapsed">Estado</span>
                                <span className="submenu-icon ml-auto"></span>
                            </div>
                        </a>*/
                    }
                </ul>
            </div>
        );
    }
};

export default SidebarFilters;