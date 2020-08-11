import React, { Component } from 'react';
import './SidebarFilters.scss';
import Select from 'react-select';
import rfdc from 'rfdc';

const deepClone = rfdc();

class SidebarFilters extends Component {

    constructor(props) {
        super();

        const statesOptions = [
            { value: "Draft", label: "Draft" },
            { value: "Policy Holder Step", label: "Policy Holder Step" },
            { value: "Start Date Step", label: "Start Date Step" },
            { value: "Pending Info", label: "Pending Info" },
            { value: "Binding Request Pending", label: "Binding Request Pending" },
        ]
        
        const brokerOptions = [
            { value: "Hiscox", label: "Hiscox" },
            { value: "Albroksa", label: "Albroksa" },
            { value: "Abella Mediación", label: "Abella Mediación" },
        ]
    
        const networkOptions = [
            { value: "RED Hiscox Connect", label: "RED Hiscox Connect" },
            { value: "RED Espabrok", label: "RED Espabrok" },
            { value: "RED AON", label: "RED AON" },
        ]
    
        const options = [
            { label: "States", options: statesOptions },
            { label: "Brokers", options: brokerOptions },
            { label: "Networks", options: networkOptions },        
        ];

        this.state = {
            collapsed: props.collapsed,
            sidebarFixed: props.sidebarFixed,
            options: options,
            filterValue: [],
        }
    }
    
    components = {
        DropdownIndicator: ""
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
        this.setState({
            filterValue: values
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