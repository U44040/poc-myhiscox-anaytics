import React, { Component } from 'react';
import rfdc from 'rfdc';
import * as FILTER_TYPES from '../../../utils/FilterTypes';
import * as STATUS from '../../../utils/StatusTypes';
import ListGroupItem from '../../Shared/ListGroupItem/ListGroupItem';
import AxisModeSelector from './AxisModeSelector/AxisModeSelector';
import userContext from '../../../context/userContext';
import * as ROLES from '../../../utils/RoleTypes';
import Sidebar from '../../Shared/Sidebar/Sidebar';
import FilterSelector from './FilterSelector/FilterSelector';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { FormGroup } from 'react-bootstrap';


const deepClone = rfdc();

class SidebarFilters extends Component {

    constructor(props) {
        super();
        this.state = {
            filterValue: [],
            specialFilterValues: [],
            axisMode: 1,
        }
    }

    static contextType = userContext;

    componentDidUpdate = (prevProps) => {
        if (prevProps.salesChartData !== this.props.salesChartData) {
            this.prepareDatePicker();
            this.prepareFilters();
            this.setState((oldState, oldProps) => (
                {
                    options: [
                        { label: "Brokers", options: oldState.brokerOptions },
                        { label: "Brokerages", options: oldState.brokerageOptions },
                        { label: "Networks", options: oldState.networkOptions },
                    ]
                }
            ));
        }
    }

    concatTypeValue = (type, value) => (type + "_" + value);

    prepareDatePicker = () => {
        let startDate = moment(this.props.salesChartData[0].date).toDate();
        let endDate = moment(this.props.salesChartData[this.props.salesChartData.length-1].date).toDate();

        this.setState({
            originalStartDate: startDate,
            startDate,
            originalEndDate: endDate,
            endDate,
        })
    }

    prepareFilters = () => {
        let brokerOptions = {};
        let brokerageOptions = {};
        let networkOptions = {};
        let sourceOptions = {};

        for (let data of this.getFilteredData()) {

            for (let project of data.projects) {
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
            }
        }

        brokerOptions = Object.values(brokerOptions).sort(this.compareLabels);
        brokerageOptions = Object.values(brokerageOptions).sort(this.compareLabels);
        networkOptions = Object.values(networkOptions).sort(this.compareLabels);
        sourceOptions = Object.values(sourceOptions).sort(this.compareLabels);

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

        this.setState({
            brokerOptions,
            brokerageOptions,
            networkOptions,
        })
    }

    compareLabels = (a, b) => a.label.localeCompare(b.label);

    filterChange = (values) => {
        let filtersByType = this.getFiltersByType(values);
        this.setState({
            filterValue: values
        }, () => {
            this.recheckOptions(values);
            this.props.updateFilters(filtersByType);
        });
    }

    recheckOptions = (values) => {
        let filtersByType = this.getFiltersByType(values);

        if (Object.keys(filtersByType).length > 0) {
            let keepGroup = Object.keys(filtersByType)[0];
            let keepOptions;
            let keepObject;
            switch (keepGroup) {
                case FILTER_TYPES.BROKER:
                    keepOptions = deepClone(this.state.brokerOptions);
                    keepObject = { brokerOptions: keepOptions }
                    break;

                case FILTER_TYPES.BROKERAGE:
                    keepOptions = deepClone(this.state.brokerageOptions);
                    keepObject = { brokerageOptions: keepOptions }
                    break

                case FILTER_TYPES.NETWORK:
                    keepOptions = deepClone(this.state.networkOptions);
                    keepObject = { networkOptions: keepOptions }
                    break;

                default:
                    break;
            }

            this.prepareFilters();
            this.setState(keepObject);
        }
        else {
            this.prepareFilters();
        }

        this.setState((oldState, oldProps) => ({
            options: [
                { label: "Brokers", options: oldState.brokerOptions },
                { label: "Brokerages", options: oldState.brokerageOptions },
                { label: "Networks", options: oldState.networkOptions },
            ]
        }));
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
                    for (let d of data) {
                        d.projects = d.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.BROKER, d.user.id)));
                    }
                    break;

                case FILTER_TYPES.BROKERAGE:
                    for (let d of data) {
                        d.projects = d.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.BROKERAGE, d.user.brokerage.id)));
                    }
                    break;

                case FILTER_TYPES.NETWORK:
                    for (let d of data) {
                        d.projects = d.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.NETWORK, d.user.brokerage.network.id)));
                    }
                    break;
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

    updateAxisMode = (e) => {
        this.setState({
            axisMode: e.target.value,
        })
    }

    setStartDate = (date) => {
        let startDate = date;
        if (startDate == null) {
            startDate = this.state.originalStartDate;
        }

        this.setState({
            startDate
        }, () => this.updateDateFilters() );
    }

    setEndDate = (date) => {
        let endDate = date;
        if (endDate == null) {
            endDate = this.state.originalEndDate;
        }
        this.setState({
            endDate
        }, () => this.updateDateFilters() );
    }

    updateDateFilters = () => {
        this.props.updateDateFilters({
            startDate: this.state.startDate,
            endDate: this.state.endDate,
        })
    }

    render = () => {
        return (
            <Sidebar
                collapsed={true}
                sidebarFixed={false}
            >

                <ListGroupItem title="FILTERS" isCollapsable collapsed></ListGroupItem>
                <div className="list-group-item-content">

                    <FormGroup className="mx-2">
                        <label htmlFor="startDate"><span class="fa fa-calendar text-primary mr-1"></span>From</label>
                        <DatePicker
                            selected={this.state.startDate}
                            onChange={this.setStartDate}
                            selectsStart
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            minDate={this.state.originalStartDate}
                            maxDate={this.state.originalEndDate}
                            dateFormat="dd/MM/y"
                            customInput={<input id="startDate" type="text" className="form-control form-control-sm" />}
                        />
                    </FormGroup>

                    <FormGroup className="mx-2">
                        <label htmlFor="endDate"><span class="fa fa-calendar text-primary mr-1"></span>To</label>
                        <DatePicker
                            selected={this.state.endDate}
                            onChange={this.setEndDate}
                            selectsEnd
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            minDate={this.state.startDate}
                            maxDate={this.state.originalEndDate}
                            dateFormat="dd/MM/y"
                            customInput={<input id="endDate" type="text" className="form-control form-control-sm" />}
                        />
                    </FormGroup>

                    <FilterSelector
                        options={this.state.options}
                        value={this.state.filterValue}
                        filterChange={this.filterChange}
                        addSpecialFilterValue={this.addSpecialFilterValue}
                        removeSpecialFilterValue={this.removeSpecialFilterValue}
                        specialFilterValues={this.state.specialFilterValues}
                    />
                </div>

                <ListGroupItem title="AXIS" isCollapsable collapsed></ListGroupItem>
                <div className="list-group-item-content">
                    <AxisModeSelector />
                </div>
            </Sidebar>
        );
    }
};

export default SidebarFilters;