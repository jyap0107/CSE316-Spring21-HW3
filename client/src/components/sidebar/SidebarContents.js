import React            from 'react';
import SidebarHeader    from './SidebarHeader';
import SidebarList      from './SidebarList';

const SidebarContents = (props) => {
    return (
        <>
            <SidebarHeader 
                auth={props.auth} createNewList={props.createNewList} 
                undo={props.undo} redo={props.redo} 
                activeid={props.activeid}
                disabled={!props.activeList._id}
            />
            <SidebarList
                activeid={props.activeid} handleSetActive={props.handleSetActive}
                todolists={props.todolists} createNewList={props.createNewList}
                updateListField={props.updateListField}
            />
        </>
    );
};

export default SidebarContents;