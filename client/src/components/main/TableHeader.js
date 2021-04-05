import React, { useState } from 'react';

import { WButton, WRow, WCol } from 'wt-frontend';


const TableHeader = (props) => {

    const buttonStyle = props.disabled ? ' table-header-button-disabled ' : 'table-header-button ';
    const clickDisabled = () => { };
    // sortAsc = true means to sort ascending.
    const [sortTasksAsc, sortTasks] = useState(false);
    const [sortDueDateAsc, sortDueDate] = useState(false);
    const [sortCompletedAsc, sortCompleted] = useState(false);
    const [sortUserAsc, sortUser] = useState(false);
    

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
    const handleUserClick = () => {
        props.sortCols(sortUserAsc, 3);
        sortUser(!sortUserAsc);
    }
    return (
        <WRow className="table-header">
            <WCol size="3">
                <WButton className='table-header-section' wType="texted" onClick={handleTasksClick}>Task</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick={handleDueDateClick}>Due Date</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick={handleCompletedClick}>Status</WButton>
            </WCol>
            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick={handleUserClick}>Assigned User</WButton>
            </WCol>
            
            <WCol size="3">
                <div className="table-header-buttons">
                    <WButton className="undo-redo" onClick={props.hasUndo ? () => props.undo : clickDisabled} wType="texted" clickAnimation="ripple-light" shape="rounded" disabled={props.hasUndo ? false : true}>
                        <i className="material-icons">undo</i>
                    </WButton>
                    <WButton className="undo-redo" onClick={props.hasRedo ? () => props.redo : clickDisabled} wType="texted" clickAnimation="ripple-light" shape="rounded" disabled={props.hasRedo ? false : true}>
                        <i className="material-icons">redo</i>
                    </WButton>
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