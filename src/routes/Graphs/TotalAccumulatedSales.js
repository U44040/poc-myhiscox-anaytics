import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import TotalAccumulatedSalesChart from '../../containers/TotalAccumulatedSalesChart/TotalAccumulatedSalesChart';
import SidebarFilters from './../../components/TotalAccumulatedSales/SidebarFilters/SidebarFilters';
import DataTable from './../../components/TotalAccumulatedSales/DataTable/DataTable';

class TotalAccumulatedSales extends Component
{

    state = {
        filters: {},
        specialFilters: [],
        dateFilters: null,
        salesChartData: [],
        aggregatedData: [],
    }

    updateChartData = (data) => {
        this.setState(
            { salesChartData: data }
        )
    }

    updateAggregatedData = (aggregatedData) => {
        this.setState(
            { aggregatedData: aggregatedData }
        )
    }

    updateFilters = (filters) => {
        this.setState(
            { filters: filters }
        )
    }

    updateDateFilters = (dateFilters) => {
        this.setState(
            { dateFilters: dateFilters}
        )
    }

    updateSpecialFilters = (specialFilters) => {
        this.setState(
            { specialFilters: specialFilters }
        )
    }

    render = () => {

        let dataTable = <div className="row mb-4">
            <DataTable data={this.state.aggregatedData} />
        </div>

        return (
            <div className="section-dashboard row">
                {<SidebarFilters
                    salesChartData={this.state.salesChartData}
                    updateFilters={this.updateFilters} 
                    updateSpecialFilters={this.updateSpecialFilters}
                    updateDateFilters={this.updateDateFilters}
                />}
                <div className="col py-3">
                    <div className="container-fluid">
                        <h3 className="text-gray-800">Total Accumulated Sales</h3>
                        <div className="row mb-4">
                            { <TotalAccumulatedSalesChart updateData={this.updateChartData} updateAggregatedData={this.updateAggregatedData} filters={this.state.filters} dateFilters={this.state.dateFilters} specialFilters={this.state.specialFilters} /> }
                        </div>

                        {dataTable}
                    </div>
                </div>
            </div>
        );
    }
    
}

export default TotalAccumulatedSales;