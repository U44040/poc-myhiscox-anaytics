import React, { Component } from 'react';
import Callout from '../../components/Shared/Callout/Callout';
import Card from '../../components/Shared/Card/Card';
import SalesChart from '../../containers/SalesChart/SalesChart';
import SidebarFilters from '../../components/SidebarFilters/SidebarFilters';


class Dashboard extends Component {

    state = {
        image: '',
        sidebarBg: '',
        collapsed: false,
        toggled: false,
      }
    
      handleToggleSidebar = (e, val) => {
        this.setState({
          toggled: val
        })
      }
    
      handleCollapseSidebar = () => {
        this.setState((state, props) => ({
          collapsed: !state.collapsed
        }))
      };

    render = () => {
    return (
        <React.Fragment>
            <SidebarFilters />
            <div class="col py-3">
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