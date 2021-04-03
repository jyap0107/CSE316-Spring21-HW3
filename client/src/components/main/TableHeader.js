import React, { useState } from 'react';

import { WButton, WRow, WCol } from 'wt-frontend';


const TableHeader = (props) => {

    const buttonStyle = props.disabled ? ' table-header-button-disabled ' : 'table-header-button ';
    const clickDisabled = () => { };
    // sortAsc = true means to sort ascending.
    const [sortTasksAsc, sortTasks] = useState(false);
    const [sortDueDateAsc, sortDueDate] = useState(false);
    const [sortCompletedAsc, sortCompleted] = useState(false);
    const handleTasksClick = () => {
        props.sortCols(sortTasksAsc, 0);
        sortTasks(!sortTasksAsc);
    }
    const handleDueDateClick = () => {
        props.sortCols(sortDueDateAsc, 1);
        sortDueDate(!sortDueDateAsc);
    }
    const handleCompletedClick = () => {
        props.sortCols(sortCompletedAsc, 2);
        sortCompleted(!sortCompletedAsc);
    }
    return (
        <WRow className="table-header">
            <WCol size="4">
                <WButton className='table-header-section' wType="texted" onClick={handleTasksClick}>Task</WButton>
            </WCol>

            <WCol size="3">
                <WButton className='table-header-section' wType="texted" onClick={handleDueDateClick}>Due Date</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick={handleCompletedClick}>Status</WButton>
            </WCol>

            <WCol size="3">
                <div className="table-header-buttons">
                    <WButton onClick={props.disabled ? clickDisabled : props.addItem} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">add_box</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.setShowDelete} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">delete_outline</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : () => props.setActiveList({})} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">close</i>
                    </WButton>
                </div>
            </WCol>

        </WRow>
    );
};

export default TableHeader;