import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import SalesChart from '../../containers/SalesChart/SalesChart';
import SidebarFilters from '../../components/SidebarFilters/SidebarFilters';
import * as STATUS from '../../utils/StatusTypes';


class Dashboard extends Component {

    state = {
        filters: {},
        specialFilters: [],
        salesChartData: [],
    }

    updateSalesChartData = (data) => {
        this.setState(
            { salesChartData: data }
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
                    <h4>Estimated sales amount: </h4>
                    <h5>{this.getEstimatedSalesAmount()}</h5>
                </Callout>
            </div>
            <div className="col-md-6">
                <Callout type="info">
                    <h4>Accumulated sales amount</h4>
                    <h5>{this.getAccumulatedSalesAmount()}</h5>
                </Callout>
            </div>
        </div>;

        return (
            <React.Fragment>
                <SidebarFilters
                    collapsed={true}
                    sidebarFixed={false}
                    salesChartData={this.state.salesChartData}
                    updateFilters={this.updateFilters} 
                    updateSpecialFilters={this.updateSpecialFilters}
                />
                <div className="col py-3">
                    <div className="container-fluid">
                        <h3 className="text-gray-800">Dashboard</h3>
                        <div className="row mb-4">
                            <SalesChart updateData={this.updateSalesChartData} filters={this.state.filters} specialFilters={this.state.specialFilters} />
                        </div>
                        {boxes}
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default Dashboard;