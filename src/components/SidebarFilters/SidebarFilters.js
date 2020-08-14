import React, { Component } from 'react';
import './SidebarFilters.scss';
import Select from 'react-select';
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
                    type: FILTER_TYPES.STATE,
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
        let statesOptions = [];
        let brokerOptions = {}
        let networkOptions = {};
        //let productOptions = {};

        for (let state of this.props.salesChartData) {

            if (Array.isArray(state.projects) && state.projects.length === 0) {
                continue;
            }

            statesOptions.push({
                label: state.state,
                value: this.concatTypeValue(FILTER_TYPES.STATE, state.state),
                type: FILTER_TYPES.STATE,
            });

            for (let project of state.projects) {
                brokerOptions[project.user.brokerage.id] = {
                    label: project.user.brokerage.name,
                    value: this.concatTypeValue(FILTER_TYPES.BROKER, project.user.brokerage.id),
                    type: FILTER_TYPES.BROKER,
                };

                networkOptions[project.user.brokerage.network.id] = {
                    label: project.user.brokerage.network.name,
                    value: this.concatTypeValue(FILTER_TYPES.NETWORK, project.user.brokerage.network.id),
                    type: FILTER_TYPES.NETWORK,
                };

                /*for (let productVariant of project.productVariants) {
                    productOptions[productVariant.idProductVariant] = {
                        label: productVariant.name,
                        value: productVariant.idProductVariant,
                    }
                }*/
            }
        }

        statesOptions.push({
            label: "Hide Issued",
            value: "HIDE_ISSUED",
            type: FILTER_TYPES.STATE,
        })

        statesOptions = statesOptions.sort(this.compareLabels);
        brokerOptions = Object.values(brokerOptions).sort(this.compareLabels);
        networkOptions = Object.values(networkOptions).sort(this.compareLabels);
        //productOptions = Object.values(productOptions);

        const options = [
            { label: "States", options: statesOptions },
            { label: "Brokers", options: brokerOptions },
            { label: "Networks", options: networkOptions },
        ]

        this.setState({
            options
        })
    }

    compareLabels = (a, b) => a.label.localeCompare(b.label);

    components = {
        DropdownIndicator: null,
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
                    <li className="list-group-item sidebar-separator-title text-muted align-items-center menu-collapsed d-flex">
                        <small>FILTROS</small>
                    </li>

                    <Select
                        isMulti
                        //key={JSON.stringify(this.state.options)}
                        name="filters"
                        menuIsOpen={true}
                        hideSelectedOptions={true}
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