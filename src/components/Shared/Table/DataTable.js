import React from 'react';
import { useTable, useSortBy } from 'react-table'
import { Table } from 'react-bootstrap';
import './DataTable.scss';


const DataTable = (props) => {

    const columns = React.useMemo(() => props.columns);
    const data = React.useMemo(() => props.data);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
        initialState: props.initialState,
        autoResetPage: false,
        autoResetExpanded: false,
        autoResetGroupBy: false,
        autoResetSelectedRows: false,
        autoResetSortBy: false,
        autoResetFilters: false,
        autoResetRowState: false,
    }, useSortBy
    );

    return (
        <Table id={props.id} className="data-table" responsive={props.responsive} stripped={props.stripped} hover={props.hover} bordered={props.bordered} {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            // Add the sorting props to control sorting. For this example
                            // we can add them into the header props
                            <th {...column.getHeaderProps(column.getSortByToggleProps({title: 'Shift+Click to multi-sort'}))}>
                                {column.render('Header')}
                                {/* Add a sort direction indicator */}
                                <span className="sort-icon">
                                    {column.isSorted
                                        ? column.isSortedDesc
                                            ? <span className="fa fa-sort-desc"></span>
                                            : <span className="fa fa-sort-asc"></span>
                                        : ''}
                                </span>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(
                    (row, i) => {
                        prepareRow(row);
                        let rowStyle;
                        if (props.rowStyle) {
                            if (typeof props.rowStyle == "function") {
                                rowStyle = props.rowStyle(row);
                            } else {
                                rowStyle = props.rowStyle;
                            }
                        }
                        return (
                            <tr className={rowStyle} {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return (
                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    )
                                })}
                            </tr>
                        )
                    }
                )}
            </tbody>
        </Table>
    );
}

export default DataTable;