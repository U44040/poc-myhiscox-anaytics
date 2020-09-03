import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import SalesChart from '../../containers/SalesChart/SalesChart';
import SidebarFilters from '../../components/SalesChart/SidebarFilters/SidebarFilters';
import * as STATUS from '../../utils/StatusTypes';
import DataTable from './../../components/SalesChart/DataTable/DataTable';


class Dashboard extends Component {

    state = {
        filters: {},
        specialFilters: [],
        salesChartData: [],
        filteredData: [],
        treshold: {
            percentage: 0,
            elapsedTime: 60,
            totalRate: 500,
        }
    }

    updateSalesChartData = (data) => {
        this.setState(
            { salesChartData: data }
        )
    }

    updateFilteredData = (data) => {
        this.setState(
            { filteredData: data }
        )
    }

    updateFilters = (filters) => {
        this.setState(
            { filters: filters }
        )
    }

    updateSpecialFilters = (specialFilters) => {
        this.setState(
            { specialFilters: specialFilters }
        )
    }

    updateTreshold = (event, type) => {
        let value = event.target.value;
        this.setState((oldState, oldProps) => {
            let treshold = {...oldState.treshold};
            if (value) {
                treshold[type] = value;
            }
            return { treshold };
        });
    }

    getEstimatedSalesAmount = () => {
        let amount = 0;
        for (let status of this.state.salesChartData) {
            if ([STATUS.APPROVED, STATUS.REJECTED].includes(status.status) == false) {
                for (let project of status.projects) {
                    amount += project.totalRate;
                }
            }
        }
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    getAccumulatedSalesAmount = () => {
        let amount = 0;
        for (let status of this.state.salesChartData) {
            if ([STATUS.APPROVED].includes(status.status)) {
                for (let project of status.projects) {
                    amount += project.totalRate;
                }
            }
        }
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    render = () => {
        let boxes = <div className="row mb-4">
            <div className="col-md-6">
                <Callout type="info">
                    <h4>Estimated sales amount: <span className="text-dark">{this.getEstimatedSalesAmount()}</span></h4>
                </Callout>
            </div>
            <div className="col-md-6">
                <Callout type="info">
                    <h4>Accumulated sales amount: <span className="text-dark">{this.getAccumulatedSalesAmount()}</span></h4>
                </Callout>
            </div>
        </div>;

        let dataTable = <div className="row mb-4">
            <DataTable data={this.state.filteredData} treshold={this.state.treshold} />
        </div>

        return (
            <div className="section-dashboard row">
                <SidebarFilters
                    salesChartData={this.state.salesChartData}
                    updateFilters={this.updateFilters} 
                    updateSpecialFilters={this.updateSpecialFilters}
                    treshold={this.state.treshold}
                    updateTreshold={this.updateTreshold}
                />
                <div className="col py-3">
                    <div className="container-fluid">
                        <h3 className="text-gray-800">Real-Time Sales</h3>
                        <div className="row mb-4">
                            <SalesChart
                                updateData={this.updateSalesChartData}
                                updateFilteredData={this.updateFilteredData}
                                filters={this.state.filters}
                                specialFilters={this.state.specialFilters}
                            />
                        </div>
                        {boxes}

                        {dataTable}
                    </div>
                </div>
            </div>
        );
    }

}

export default Dashboard;