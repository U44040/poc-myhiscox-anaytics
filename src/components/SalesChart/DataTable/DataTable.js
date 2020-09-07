
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
                    Header: 'Reference',
                    accessor: 'reference',
                },
                {
                    id: 'totalRate',
                    Header: 'Total Rate',
                    accessor: (d) => d3.sum(d.productVariants.map(pv => pv.totalRate)),
                    Cell: (d) => {
                        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(d.cell.value);
                    }
                },
                {
                    Header: 'Broker',
                    accessor: 'user.name',
                },
                {
                    Header: 'Brokerage',
                    accessor: 'user.brokerage.name',
                },
                {
                    Header: 'Network',
                    accessor: 'user.brokerage.network.name',
                },
                {
                    id: 'status',
                    Header: 'Status',
                    accessor: 'status',
                },
                {
                    Header: 'Clean',
                    accessor: (d => d.isClean ? 'Yes' : 'No'),
                },
                {
                    Header: 'Source',
                    accessor: 'source',
                },
                {
                    id: 'fullPercentAverage',
                    Header: 'Percentage',
                    accessor: (d) => d3.mean(d.productVariants.map(pv => pv.percentAverage)),
                    Cell: (d => Math.round(d.cell.value) + '%'),
                    sortType: 'basic',
                },
                {
                    id: 'elapsedTime',
                    Header: 'Elapsed Time',
                    accessor: 'elapsedTime',
                    Cell: (d) => {
                        let duration = moment.duration(d.cell.value, "minutes");
                        return (duration.hours() == 0 ? '' : duration.hours() + " hours ") + duration.minutes() + " minutes";
                    },
                },
            ],
            tableOptions: {
                isMultiSortEvent: (event) => (event.ctrlKey === true),
                initialState: {
                    sortBy: [
                        { id: 'fullPercentAverage', desc: true },
                        { id: 'elapsedTime', desc: true },
                        { id: 'totalRate', desc: true },
                    ],
                },
            },
            rowCustomProps: this.getRowCustomProps,
        }
    }

    getRowCustomProps = (row) => {
        let percentage = row.cells.find(d => d.column.id == "fullPercentAverage").value > this.props.treshold.percentage;
        let elapsedTime = row.cells.find(d => d.column.id == "elapsedTime").value > this.props.treshold.elapsedTime;
        let totalRate = row.cells.find(d => d.column.id == "totalRate").value > this.props.treshold.totalRate;
        let status = ['Approved', 'Rejected'].includes(row.cells.find(d => d.column.id == "status").value) === false;

        let reference = row.cells.find(d => d.column.id == "reference").value;

        return {
            projectReference: reference,
            onClick: (e) => {
                let el = document.getElementById('project-' + reference);
                if (el) {
                    el.dispatchEvent(new Event("click"));
                }
            },
            className: (percentage && elapsedTime && totalRate && status ? 'bg-highlight' : ''),
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.data !== this.props.data) {
            this.prepareData(this.props.data);
        }
    }

    prepareData = (data) => {
        let preparedData = [];
        for (let d of data) {
            preparedData = preparedData.concat(d.projects);
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