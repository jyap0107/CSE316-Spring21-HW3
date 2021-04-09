import React, { useState, useEffect } 	from 'react';
import Logo 							from '../navbar/Logo';
import NavbarOptions 					from '../navbar/NavbarOptions';
import MainContents 					from '../main/MainContents';
import SidebarContents 					from '../sidebar/SidebarContents';
import Login 							from '../modals/Login';
import Delete 							from '../modals/Delete';
import CreateAccount 					from '../modals/CreateAccount';
import { GET_DB_TODOS } 				from '../../cache/queries';
import * as mutations 					from '../../cache/mutations';
import { useMutation, useQuery } 		from '@apollo/client';
import { WNavbar, WSidebar, WNavItem } 	from 'wt-frontend';
import { WLayout, WLHeader, WLMain, WLSide } from 'wt-frontend';
import { UpdateListField_Transaction, 
	UpdateListItems_Transaction, 
	ReorderItems_Transaction, 
	EditItem_Transaction, 
	SortCols_Transaction} 				from '../../utils/jsTPS';
import WInput from 'wt-frontend/build/components/winput/WInput';


const Homescreen = (props) => {

	let todolists 							= [];
	const [activeList, setActiveList] 		= useState({});
	const [showDelete, toggleShowDelete] 	= useState(false);
	const [showLogin, toggleShowLogin] 		= useState(false);
	const [showCreate, toggleShowCreate] 	= useState(false);
	const [hasUndo, setCanUndo] 			= useState(false);
    const [hasRedo, setCanRedo] 			= useState(false);

	const [ReorderTodoItems] 		= useMutation(mutations.REORDER_ITEMS);
	const [UpdateTodoItemField] 	= useMutation(mutations.UPDATE_ITEM_FIELD);
	const [UpdateTodolistField] 	= useMutation(mutations.UPDATE_TODOLIST_FIELD);
	const [DeleteTodolist] 			= useMutation(mutations.DELETE_TODOLIST);
	const [DeleteTodoItem] 			= useMutation(mutations.DELETE_ITEM);
	const [AddTodolist] 			= useMutation(mutations.ADD_TODOLIST);
	const [AddTodoItem] 			= useMutation(mutations.ADD_ITEM);
	const [SortCols]				= useMutation(mutations.SORT_COLS);
	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
		}, [props.tps])
	// const [ActiveListTop]			= useMutation(mutations.ACTIVE_LIST_TOP);


	//Get DB TodoList and items from cache
	const { loading, error, data, refetch } = useQuery(GET_DB_TODOS, {variables: {_id: activeList._id}});
	if(loading) { console.log(loading, 'loading'); }
	if(error) { console.log(error, 'error'); }
	//If there is data, then call getAllTodos from within queries cache
	if(data) { todolists = data.getAllTodos; }

	const auth = props.user === null ? false : true;

	// If has been done before, via refetch, then set active list to the tempId.
	// activeList is defined as a hook.
	const refetchTodos = async (refetch, _id = "") => {
		const { loading, error, data } = await refetch({variables: {_id: _id}});
		if (data) {
			todolists = data.getAllTodos;
			if (activeList._id) {
				setActiveList((activeList) => {
					if (activeList._id) {
						let tempID = activeList._id;
						let list = todolists.find(list => list._id === tempID);
						return list;
					}
				})
		}
			// if (activeList._id) {
			// 	let tempID = activeList._id;
			// 	let list = todolists.find(list => list._id === tempID);
			// 	setActiveList(list);
			// }
			return true;
		}
		return false;
	}
	// Undo
	const tpsUndo = async () => {
		console.log("Undo called.");
		const retVal = await props.tps.undoTransaction();
		refetchTodos(refetch);
		handleSetUndo();
		handleSetRedo();
		return retVal;
	}
	// Redo
	const tpsRedo = async () => {
		console.log("Redo called.");
		const retVal = await props.tps.doTransaction();
		refetchTodos(refetch);
		handleSetUndo();
		handleSetRedo();
		return retVal;
	}


	// Creates a default item and passes it to the backend resolver.
	// The return id is assigned to the item, and the item is appended
	//  to the local cache copy of the active todolist. 
	const addItem = async () => {
		let list = activeList;
		const items = list.items;
		const lastID = items.length >= 1 ? items[items.length - 1].id + 1 : 0;
		const newItem = {
			_id: '',
			id: lastID,
			description: 'No Description',
			due_date: 'No Date',
			assigned_to: 'No User',
			completed: false
		};
		let opcode = 1;
		//transaction
		let itemID = newItem._id;
		let listID = activeList._id;
		let transaction = new UpdateListItems_Transaction(listID, itemID, newItem, opcode, AddTodoItem, DeleteTodoItem);
		const retVal = await props.tps.addTransaction(transaction);
		await tpsRedo();
		handleSetUndo();
		handleSetRedo();
	};
    /*
	Takes in a given item to delete, as well as the active list ID and the item ID.
	Adds the transaction of Updating list items.
	*/
	const deleteItem = async (item, index) => {
		let listID = activeList._id;
		let itemID = item._id;
		let opcode = 0;
		let itemToDelete = {
			_id: item._id,
			id: item.id,
			description: item.description,
			due_date: item.due_date,
			assigned_to: item.assigned_to,
			completed: item.completed
		}
		let transaction = new UpdateListItems_Transaction(listID, itemID, itemToDelete, opcode, AddTodoItem, DeleteTodoItem, index);
		props.tps.addTransaction(transaction);
		await tpsRedo();
		handleSetUndo();
		handleSetRedo();
	};

	const editItem = async (itemID, field, value, prev) => {
		if (value == prev) {
			return;
		}
		let flag = 0;
		if (field === 'completed') flag = 1;
		let listID = activeList._id;
		let transaction = new EditItem_Transaction(listID, itemID, field, prev, value, flag, UpdateTodoItemField);
		props.tps.addTransaction(transaction);
		await tpsRedo();
		handleSetUndo();
		handleSetRedo();
	};

	const reorderItem = async (itemID, dir) => {
		let listID = activeList._id;
		let transaction = new ReorderItems_Transaction(listID, itemID, dir, ReorderTodoItems);
		props.tps.addTransaction(transaction);
		await tpsRedo();
		handleSetUndo();
		handleSetRedo();
	};
	const handleClickClose = async () => {
		props.tps.clearAllTransactions();
		setActiveList([]);
		handleSetUndo();
		handleSetRedo();
	}
	const createNewList = async () => {
		console.log("create");
		console.log(todolists);
		const length = todolists.length
		const id = length >= 1 ? todolists[length - 1].id + Math.floor((Math.random() * 100) + 1) : 1;
		let list = {
			_id: '',
			id: id,
			name: 'Untitled',
			owner: props.user._id,
			items: [],
		}
		const { data } = await AddTodolist({ variables: { todolist: list }, refetchQueries: [{ query: GET_DB_TODOS}] });
		if (data) {
			list._id = data.addTodolist;
			// refetch({variables: {_id: list._id}});
			let temp = await refetchTodos(refetch, list._id);
			if (temp) {
				setActiveList(list);
				props.tps.clearAllTransactions();
			}
			
			// handleSetUndo();
			// handleSetRedo();
		}
		
	};

	const deleteList = async (_id) => {
		console.log("delete");
		DeleteTodolist({ variables: { _id: _id }, refetchQueries: [{ query: GET_DB_TODOS }] });
		props.tps.clearAllTransactions();
		handleSetUndo();
		handleSetRedo();
		setActiveList({});
		refetch();
		console.log(todolists.length);

	};

	const updateListField = async (_id, field, value, prev) => {
		console.log(value);
		console.log(prev);
		let transaction = new UpdateListField_Transaction(_id, field, prev, value, UpdateTodolistField);
		props.tps.addTransaction(transaction);
		await tpsRedo();
		if (field == "name") {
			await props.tps.clearAllTransactions();
			handleSetUndo();
			handleSetRedo();
		}
	};
	
	const handleSetActive = async (id) => {
		const todo = todolists.find(todo => todo.id === id || todo._id === id);
		id = id.toString();
		props.tps.clearAllTransactions();
		// console.log("JIMBO")
		// refetch({variables: {_id: "JIMBO"}});
		await setActiveList(todo)
		// console.log("SIZE:");
		console.log(todolists);
		handleSetUndo();
		handleSetRedo();
		refetch({variables: {_id: id}});
	};
	// sortAsc = null or false, make it true and sort it ascending. sortAsc = what it is currently doing.
	// Takes SortCols mutation and applies it as a callback in tps.
	const sortCols = async (sortAsc, col) => {
		let listID = activeList._id;
		let transaction = new SortCols_Transaction(listID, sortAsc, col, activeList.items, SortCols);
		props.tps.addTransaction(transaction);
		await tpsRedo();
		handleSetUndo();
		handleSetRedo();
	}
	
	/*
		Since we only have 3 modals, this sort of hardcoding isnt an issue, if there
		were more it would probably make sense to make a general modal component, and
		a modal manager that handles which to show.
	*/
	const setShowLogin = () => {
		toggleShowDelete(false);
		toggleShowCreate(false);
		toggleShowLogin(!showLogin);
		console.log(showLogin);
	};

	const setShowCreate = () => {
		toggleShowDelete(false);
		toggleShowLogin(false);
		toggleShowCreate(!showCreate);
	};

	const setShowDelete = () => {
		toggleShowCreate(false);
		toggleShowLogin(false);
		toggleShowDelete(!showDelete)
	}
	const handleSetUndo = () => {
		const checkUndo = props.tps.hasTransactionToUndo();
		if (checkUndo) setCanUndo(true);
		else setCanUndo(false);

	}
	const handleSetRedo = () => {
		const checkRedo = props.tps.hasTransactionToRedo();
		console.log(checkRedo);
		if (checkRedo) setCanRedo(true);
		else setCanRedo(false);
	}
	const handleKeyPress = (event) => {

		console.log("yeah");
		if (event.ctrlKey && event.key == "z") {
		  tpsUndo();
		}
		if (event.ctrlKey && event.key == "y") {
		  tpsRedo();
		}
	  }

	return (
		<WLayout wLayout="header-lside" onKeyDown={handleKeyPress}
		>
			<WLHeader>
				<WNavbar color="colored">
					<ul>
						<WNavItem>
							<Logo className='logo' />
						</WNavItem>
					</ul>
					<ul>
						<NavbarOptions
							fetchUser={props.fetchUser} auth={auth} 
							setShowCreate={setShowCreate} setShowLogin={setShowLogin}
							refetchTodos={refetch} setActiveList={setActiveList}
						/>
					</ul>
				</WNavbar>
			</WLHeader>

			<WLSide side="left">
				<WSidebar>
					{
						activeList ?
							<SidebarContents
								todolists={todolists} activeid={activeList.id} auth={auth}
								handleSetActive={handleSetActive} createNewList={createNewList}
								undo={tpsUndo} redo={tpsRedo}
								updateListField={updateListField}
								activeList={activeList}
							/>
							:
							<></>
					}
				</WSidebar>
			</WLSide>
			<WLMain>
				{
					activeList ? 
							<div className="container-secondary">
								<MainContents
									addItem={addItem} deleteItem={deleteItem}
									editItem={editItem} reorderItem={reorderItem}
									setShowDelete={setShowDelete}
									activeList={activeList} setActiveList={setActiveList}
									sortCols={sortCols}
									undo={tpsUndo}
									redo={tpsRedo}
									hasUndo={hasUndo}
									hasRedo={hasRedo}
									handleClickClose ={handleClickClose}
								/>
							</div>
						:
							<div className="container-secondary" />
				}

			</WLMain>

			{
				showDelete && (<Delete deleteList={deleteList} activeid={activeList._id} setShowDelete={setShowDelete} />)
			}

			{
				showCreate && (<CreateAccount fetchUser={props.fetchUser} setShowCreate={setShowCreate} />)
			}

			{
				showLogin && (<Login fetchUser={props.fetchUser} refetchTodos={refetch}setShowLogin={setShowLogin} />)
			}

		</WLayout>
	);
};

export default Homescreen;