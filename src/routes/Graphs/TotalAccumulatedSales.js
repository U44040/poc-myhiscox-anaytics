import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import SidebarFilters from '../../components/TotalAccumulatedSales/SidebarFilters/SidebarFilters';
import TotalAccumulatedSalesChart from '../../containers/TotalAccumulatedSalesChart/TotalAccumulatedSalesChart';

class TotalAccumulatedSales extends Component
{

    state = {
        filters: {},
        specialFilters: [],
        salesChartData: [],
    }

    updateChartData = (data) => {
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

    render = () => {
        let boxes = <div className="row mb-4">
            <div className="col-md-6">
                <Callout type="info">
                    <h4>Estimated sales amount: <span className="text-dark"></span></h4>
                </Callout>
            </div>
            <div className="col-md-6">
                <Callout type="info">
                    <h4>Accumulated sales amount: <span className="text-dark"></span></h4>
                </Callout>
            </div>
        </div>;

        return (
            <div className="section-dashboard row">
                {/*<SidebarFilters
                    salesChartData={this.state.salesChartData}
                    updateFilters={this.updateFilters} 
                    updateSpecialFilters={this.updateSpecialFilters}
                />*/}
                <div className="col py-3">
                    <div className="container-fluid">
                        <h3 className="text-gray-800">Total accumulated Sales</h3>
                        <div className="row mb-4">
                            { <TotalAccumulatedSalesChart updateData={this.updateChartData} filters={this.state.filters} specialFilters={this.state.specialFilters} /> }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default TotalAccumulatedSales;