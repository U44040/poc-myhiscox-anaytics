import React, { Component } from 'react';
import './SidebarFilters.scss';
import Select, { components } from 'react-select';
import rfdc from 'rfdc';
import * as FILTER_TYPES from './FilterTypes';

const deepClone = rfdc();

class SidebarFilters extends Component {

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
        }
    }

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

        for (let status of this.props.salesChartData) {

            if (Array.isArray(status.projects) && status.projects.length === 0) {
                continue;
            }

            statusOptions.push({
                label: status.status,
                value: this.concatTypeValue(FILTER_TYPES.STATUS, status.status),
                type: FILTER_TYPES.STATUS,
            });

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
        brokerOptions = Object.values(brokerOptions).sort(this.compareLabels);
        brokerageOptions = Object.values(brokerageOptions).sort(this.compareLabels);
        networkOptions = Object.values(networkOptions).sort(this.compareLabels);
        sourceOptions = Object.values(sourceOptions).sort(this.compareLabels);
        productOptions = Object.values(productOptions);

        const options = [
            { label: "Brokers", options: brokerOptions },
            { label: "Networks", options: networkOptions },
            { label: "Brokerages", options: brokerageOptions },
            { label: "Products", options: productOptions },
            { label: "Status", options: statusOptions },
            { label: "Source", options: sourceOptions },
        ]

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

    OptionComponent = props => (
        <div>
            <components.Option {...props}>
                <input type="checkbox" checked={props.isSelected} />
                <label>{props.label}</label>
            </components.Option>
        </div>
    );

    components = {
        DropdownIndicator: null,
        GroupHeading: this.CustomGroupHeading,
        Option: this.OptionComponent,
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
        let filtersByType = {};
        if (Array.isArray(values)) {
            for (let filter of values) {
                if (filtersByType[filter.type] == undefined) {
                  filtersByType[filter.type] = [];
                }
                filtersByType[filter.type].push(filter);
              }
        }
        this.setState({
            filterValue: values
        }, () => this.props.updateFilters(filtersByType));
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
                <ul className="list-group sticky-top sticky-offset">
                    <li className="sidebar-fixed-button text-right">
                        <span className={iconSidebarFixed} onClick={this.toggleSidebarFixed}></span>
                    </li>
                    <li className="list-group-item sidebar-separator-title align-items-center menu-collapsed d-flex">
                        <small>FILTERS</small>
                    </li>

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
                        onChange={this.filterChange}
                        maxMenuHeight={500}
                    />

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