import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import BarChartRaceContainer from './../../containers/BarChartRace/BarChartRace';
import SidebarFilters from '../../components/BarChartRace/SidebarFilters/SidebarFilters';
import * as STATUS from '../../utils/StatusTypes';


class BarChartRace extends Component {

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
                    <h4>Estimated sales amount: <span className="text-dark">{this.getEstimatedSalesAmount()}</span></h4>
                </Callout>
            </div>
            <div className="col-md-6">
                <Callout type="info">
                    <h4>Accumulated sales amount: <span className="text-dark">{this.getAccumulatedSalesAmount()}</span></h4>
                </Callout>
            </div>
        </div>;

        return (
            <div className="section-dashboard row">
                <SidebarFilters
                    salesChartData={this.state.salesChartData}
                    updateFilters={this.updateFilters} 
                    updateSpecialFilters={this.updateSpecialFilters}
                />
                <div className="col py-3">
                    <div className="container-fluid">
                        <h3 className="text-gray-800">Real-Time Bar Chart Race</h3>
                        <div className="row mb-4">
                            <BarChartRaceContainer updateData={this.updateSalesChartData} filters={this.state.filters} specialFilters={this.state.specialFilters} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default BarChartRace;