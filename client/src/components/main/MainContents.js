import React            from 'react';
import TableHeader      from './TableHeader';
import TableContents    from './TableContents';

const MainContents = (props) => {
    return (
        <div className='table ' >
            <TableHeader
                disabled={!props.activeList._id} addItem={props.addItem}
                setShowDelete={props.setShowDelete} setActiveList={props.setActiveList}
                sortCols={props.sortCols}
                undo={props.undo}
                redo={props.redo}
                hasUndo={props.hasUndo}
                hasRedo={props.hasRedo}
                activeList={props.activeList}
                handleClickClose={props.handleClickClose}
            />
            <TableContents
                key={props.activeList.id} activeList={props.activeList}
                deleteItem={props.deleteItem} reorderItem={props.reorderItem}
                editItem={props.editItem}

            />
        </div>
    );
};

export default MainContents;