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
    
    render = () => {
        return (
            <div className="section-dashboard row">
                <SidebarFilters
                    salesChartData={this.state.salesChartData}
                    updateFilters={this.updateFilters}
                    updateSpecialFilters={this.updateSpecialFilters}
                />
                <div className="col py-3">
                    <div className="container-fluid">
                        <h3 className="text-gray-800">Sales Race</h3>
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