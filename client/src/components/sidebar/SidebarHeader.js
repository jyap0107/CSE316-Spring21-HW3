import React                    from 'react';
import { WButton, WRow, WCol }  from 'wt-frontend';



const SidebarHeader = (props) => {
    const clickedAdd = () => {
        props.createNewList();
    }
    const clickDisabled = () => {
    }
    return (
        <WRow className='sidebar-header'>
            <WCol size="7">
                <WButton wType="texted" hoverAnimation="text-primary" className='sidebar-header-name'>
                    Todolists
                </WButton>
            </WCol>

            <WCol size="5">
                {
                    props.auth && <div className="sidebar-options">
                        <WButton className="sidebar-buttons" onClick={props.disabled ? props.createNewList : clickDisabled} clickAnimation="ripple-light" shape="rounded" color="primary" disabled={props.disabled ? false : true}>
                            <i className="material-icons">add</i>
                        </WButton>
    
                    </div>
                }
            </WCol>

        </WRow>

    );
};

export default SidebarHeader;