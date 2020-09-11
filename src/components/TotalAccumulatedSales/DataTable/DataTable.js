
import React, { Component } from 'react';
import Card from './../../Shared/Card/Card';
import SmartDataTable from './../../Shared/Table/DataTable';
import moment from 'moment';
import * as d3 from 'd3';

class DataTable extends Component {

    constructor(props) {
        super();

        this.state = {
            data: [],
            columns: [
                {
                    Header: 'Name',
                    accessor: 'label',
                },
                {
                    id: 'total',
                    Header: 'Total',
                    accessor: 'total',
                    Cell: (d) => {
                        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(d.cell.value);
                    }
                },
                {
                    id: 'numProjects',
                    Header: 'Nº Projects',
                    accessor: (d) => d.projects.length,
                    Cell: (d) => {
                        return new Intl.NumberFormat('es-ES', {  }).format(d.cell.value);
                    }
                },
                {
                    id: 'maxRate',
                    Header: 'Max. Rate',
                    accessor: 'maxRate',
                    Cell: (d) => {
                        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(d.cell.value);
                    }
                },
                {
                    id: 'avgRate',
                    Header: 'Avg. Rate',
                    accessor: (d) => d.total / d.projects.length,
                    Cell: (d) => {
                        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(d.cell.value);
                    }
                },

            ],
            tableOptions: {
                isMultiSortEvent: (event) => (event.ctrlKey === true),
                initialState: {
                    sortBy: [
                        { id: 'total', desc: true },
                    ],
                },
            },
            //rowCustomProps: this.getRowCustomProps,
        }
    }

    /*getRowCustomProps = (row) => {
       
    }*/

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.data !== this.props.data) {
            this.prepareData(this.props.data);
        }
    }

    prepareData = (data) => {
        let preparedData = [];
        for (let d of data) {
            let projects = [];

            for (let value of d.values) {
                for (let item of value.items) {
                    for (let project of item.projects) {
                        projects.push(project)
                    }
                }
            }

            preparedData.push({
                ...d,
                projects: projects,
                maxRate: d3.max(projects.map(p => p.totalRate)),
                total: d3.sum(d.values.map(d => d.volume)),
            })
        }

        this.setState({
            data: preparedData,
        })
    }

    render = () => {

        return (
            <div className="col-md">
                <Card type="primary" /* header="Dataset" title="Tiempo real" text="Gráfica en tiempo real de las pólizas que se están creando"*/ >
                    <SmartDataTable
                        columns={this.state.columns}
                        data={this.state.data}
                        tableOptions={this.state.tableOptions}
                        rowCustomProps={this.state.rowCustomProps}
                        stripped
                        hover
                        responsive
                    />
                </Card>
            </div>
        );
    }

}

export default DataTable;