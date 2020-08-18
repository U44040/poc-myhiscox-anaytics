import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import SalesChart from '../../containers/SalesChart/SalesChart';
import SidebarFilters from '../../components/SidebarFilters/SidebarFilters';


class Dashboard extends Component {

    state = {
        filters: []
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

    render = () => {
        return (
            <React.Fragment>
                <SidebarFilters collapsed={true} sidebarFixed={false} salesChartData={this.state.salesChartData} updateFilters={this.updateFilters} />
                <div className="col py-3">
                    <div className="container-fluid">
                        <h3 className="text-gray-800">Dashboard</h3>
                        <div className="row mb-4">
                            <SalesChart updateData={this.updateSalesChartData} filters={this.state.filters} />
                        </div>
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <Callout type="info">
                                    <h4 id="dealing-with-specificity">Estimated sales amount</h4>
                                    <p>€ 120K</p>
                                </Callout>
                            </div>
                            <div className="col-md-6">
                                <Callout type="info">
                                    <h4 id="dealing-with-specificity">Accumulated sales amount</h4>
                                    <p>€ 60K</p>
                                </Callout>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default Dashboard;