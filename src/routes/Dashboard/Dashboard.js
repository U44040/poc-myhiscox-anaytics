import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import SalesChart from '../../containers/SalesChart/SalesChart';
import SidebarFilters from '../../components/SidebarFilters/SidebarFilters';


class Dashboard extends Component {

    state = {
        collapsed: true,
        sidebarFixed: false,
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

    render = () => {
    return (
        <React.Fragment>
            <SidebarFilters collapsed={this.state.collapsed} sidebarFixed={this.state.sidebarFixed} showSidebar={this.showSidebar} hideSidebar={this.hideSidebar} toggleSidebarFixed={this.toggleSidebarFixed} />
            <div className="col py-3">
                <div className="container-fluid">
                    <h3 className="text-gray-800">Dashboard</h3>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <Callout type="info">
                                <h4 id="dealing-with-specificity">Importe de ventas estimado</h4>
                                <p>€ 120K</p>
                            </Callout>
                        </div>
                        <div className="col-md-6">
                            <Callout type="info">
                                <h4 id="dealing-with-specificity">Importe de ventas acumulado</h4>
                                <p>€ 60K</p>
                            </Callout>
                        </div>
                    </div>
                    <div className="row mb-4">
                        <SalesChart />
                    </div>
                </div>
            </div>
        </React.Fragment>
        );
    }

}

export default Dashboard;