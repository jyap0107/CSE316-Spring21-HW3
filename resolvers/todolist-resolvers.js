const ObjectId = require('mongoose').Types.ObjectId;
const Todolist = require('../models/todolist-model');

// The underscore param, "_", is a wildcard that can represent any value;
// here it is a stand-in for the parent parameter, which can be read about in
// the Apollo Server documentation regarding resolvers

module.exports = {
	Query: {
		/** 
		 	@param 	 {object} req - the request object containing a user id
			@returns {array} an array of todolist objects on success, and an empty array on failure
		**/
		getAllTodos: async (_, args, { req }) => {
			const _id = new ObjectId(req.userId);
			if(!_id) { return([])};
			const todolists = await Todolist.find({owner: _id});
			if(todolists) {
				if (args) {
					console.log("HERE")
					console.log(args);
				}
				return (todolists);
			}
		},
		/** 
		 	@param 	 {object} args - a todolist id
			@returns {object} a todolist on success and an empty object on failure
		**/
		getTodoById: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const todolist = await Todolist.findOne({_id: objectId});
			if(todolist) return todolist;
			else return ({});
		},
	},
	Mutation: {
		/** 
		 	@param 	 {object} args - a todolist id and an empty item object
			@returns {string} the objectID of the item or an error message
		**/
		addItem: async(_, args) => {
			const { _id, item } = args;
			const listId = new ObjectId(_id);
			const objectId = new ObjectId();
			const found = await Todolist.findOne({_id: listId});
			if(!found) return ('Todolist not found');
			item._id = objectId;
			let listItems = found.items;
			listItems.push(item);
			
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems });

			if(updated) return (objectId);
			else return ('Could not add item');
		},
		/** 
		 	@param 	 {object} args - an empty todolist object
			@returns {string} the objectID of the todolist or an error message
		**/
		addTodolist: async (_, args) => {
			const { todolist } = args;
			const objectId = new ObjectId();
			const { id, name, owner, items } = todolist;
			const newList = new Todolist({
				_id: objectId,
				id: id,
				name: name,
				owner: owner,
				items: items
			});
			const updated = newList.save();
			if(updated) return objectId;
			else return ('Could not add todolist');
		},
		/** 
		 	@param 	 {object} args - a todolist objectID and item objectID
			@returns {array} the updated item array on success or the initial 
							 array on failure
		**/
		deleteItem: async (_, args) => {
			const  { _id, itemId } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			listItems = listItems.filter(item => item._id.toString() !== itemId);
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			else return (found.items);

		},
		/** 
		 	@param 	 {object} args - a todolist objectID 
			@returns {boolean} true on successful delete, false on failure
		**/
		deleteTodolist: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const deleted = await Todolist.deleteOne({_id: objectId});
			if(deleted) return true;
			else return false;
		},
		/** 
		 	@param 	 {object} args - a todolist objectID, field, and the update value
			@returns {boolean} true on successful update, false on failure
		**/
		updateTodolistField: async (_, args) => {
			const { field, value, _id } = args;
			const objectId = new ObjectId(_id);
			const updated = await Todolist.updateOne({_id: objectId}, {[field]: value});
			if(updated) return value;
			else return "";
		},
		/** 
			@param	 {object} args - a todolist objectID, an item objectID, field, and
									 update value. Flag is used to interpret the completed 
									 field,as it uses a boolean instead of a string
			@returns {array} the updated item array on success, or the initial item array on failure
		**/
		updateItemField: async (_, args) => {
			const { _id, itemId, field,  flag } = args;
			let { value } = args
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			if(flag === 1) {
				if(value === 'complete') { value = true; }
				if(value === 'incomplete') { value = false; }
			}
			listItems.map(item => {
				if(item._id.toString() === itemId) {	
					
					item[field] = value;
				}
			});
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			else return (found.items);
		},
		/**
			@param 	 {object} args - contains list id, item to swap, and swap direction
			@returns {array} the reordered item array on success, or initial ordering on failure
		**/
		reorderItems: async (_, args) => {
			const { _id, itemId, direction } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			const index = listItems.findIndex(item => item._id.toString() === itemId);
			// move selected item visually down the list
			if(direction === 1 && index < listItems.length - 1) {
				let next = listItems[index + 1];
				let current = listItems[index]
				listItems[index + 1] = current;
				listItems[index] = next;
			}
			// move selected item visually up the list
			else if(direction === -1 && index > 0) {
				let prev = listItems[index - 1];
				let current = listItems[index]
				listItems[index - 1] = current;
				listItems[index] = prev;
			}
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			// return old ordering if reorder was unsuccessful
			listItems = found.items;
			return (found.items);
		},
		/**
			@param 	 {object} args - contains list id, how to sort (0 or 1 means to sort asc, 2 desc), and flag (what to sort by)
			@returns {array} the reordered item array on success, or initial ordering on failure
		**/
		sortCols: async (_, args) => {
			const { _id, sortAsc, col} = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			// Description
			if (col == 0) {
				if (sortAsc) {
					listItems.sort(function(item1, item2) {
						var first = item1.description;
						var second = item2.description;
						return (first < second) ? -1 : (first > second) ? 1 : 0;
					})
				}
				else {
					listItems.sort(function(item1, item2) {
						var first = item1.description;
						var second = item2.description;
						return (first > second) ? -1 : (first < second) ? 1 : 0;
					})
				}
			}
			// Due Date
			if (col == 1) {
				if (sortAsc) {
					listItems.sort(function(item1, item2) {
						var first = item1.due_date;
						var second = item2.due_date;
						return (first < second) ? -1 : (first > second) ? 1 : 0;
					})
				}
				else {
					listItems.sort(function(item1, item2) {
						var first = item1.due_date;
						var second = item2.due_date;
						return (first > second) ? -1 : (first < second) ? 1 : 0;
					})
				}
			}
			// Status
			if (col == 2) {
				if (sortAsc) {
					listItems.sort(function(item1, item2) {
						var first = item1.completed;
						var second = item2.completed;
						return (first < second) ? -1 : (first > second) ? 1 : 0;
					})
				}
				else {
					listItems.sort(function(item1, item2) {
						var first = item1.completed;
						var second = item2.completed;
						return (first > second) ? -1 : (first < second) ? 1 : 0;
					})
				}
			}
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if (updated) return (listItems);
			return (found.items);
		},
		// args is the ID of the list to bring to the top.
		activeListTop: async (_, args, {req}) => {
			// const _id = new ObjectId(req.userId);
			// if(!_id) { return true};
			// const todolists = await Todolist.find({owner: _id});
			// const { id } = args;
			// console.log("BEFOREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
			// console.log(todolists);
			// console.log("AFTERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
			// let topList = null
			// for (let i = 0; i < todolists.length; i++) {
			// 	if (todolists[i].id == id) {
			// 		topList = todolists[i];
			// 		todolists.splice(i, 1);
			// 		break;
			// 	}
			// }
			// if (topList == null) { return false };
			// todolists.unshift(topList);
			// console.log(todolists);
			return true;
		}
	}
}