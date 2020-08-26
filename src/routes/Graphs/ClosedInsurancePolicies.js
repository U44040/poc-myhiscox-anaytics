import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import SidebarFilters from './../../components/ClosedInsurancePolicies/SidebarFilters/SidebarFilters';

class ClosedInsurancePolicies extends Component
{

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
                        <h3 className="text-gray-800">Closed Insurance Policies</h3>
                        <div className="row mb-4">
                            { /*<SalesChart updateData={this.updateSalesChartData} filters={this.state.filters} specialFilters={this.state.specialFilters} /> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default ClosedInsurancePolicies;