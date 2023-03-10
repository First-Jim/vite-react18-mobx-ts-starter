import { types, destroy, unprotect, protect, isMapType, getPropertyMembers, getType } from 'mobx-state-tree';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';
import { isDef } from '@/utils';
import { v4 as uuid } from 'uuid';

// NOTE mst好用的api
// * getPropertyMembers(type) 获取模型类的名称和属性定义信息，如果希望对模型类有检查，用这个
// * getType(node) 根据模型实例反向取到模型类

// 添加通用的action
// .actions(commonAction([
//   'set',
// ]))
export const commonAction =
	(actions = [] as any[]) =>
	(self) => {
		// 内置的通用action大全
		const collection = {
			set(key, value) {
				if (isString(key)) {
					self[key] = value;
				} else if (isPlainObject(key)) {
					Object.entries(key).forEach(([k, v]) => (self[k] = v));
				}
				if (self.art) {
					self.art.snapshot();
				}
			},

			/**
			 * 选中状态管理
			 * 添加下面的方法，先需要添加 selected 属性，如下：
			 * selected: types.maybe(types.reference(MXxxItem)),
			 * 而且，MXxxItem模型需要有select/unselect方法
			 */
			// 选中
			selectItem(item) {
				self.selectNone();
				self.selected = item;
				self.selected.select();
			},

			// 选没
			selectNone() {
				if (self.selected) {
					self.selected.unselect();
					self.selected = undefined;
				}
			},

			// NOTE option.copy 是否是复制的场景，如果是，遇到id属性时，id值重新生成
			getSchema(option) {
				return getModelSchema(self, option);
			},

			setSchema(schema) {
				setModelSchema(self, schema);
			},

			clearSchema() {
				clearModelSchema(self);
			},

			// TODO
			copySchema() {
				return getModelSchema(self, { copy: true });
			},

			dumpSchema(option) {
				console.log(JSON.stringify(getModelSchema(self, option), null, 4));
			},
		};

		// 待使用的
		const toUseCollection = {};

		actions.forEach((action) => {
			if (collection[action]) {
				toUseCollection[action] = collection[action];
			}
		});

		return toUseCollection;
	};

// 从可监听对象实例上提取要保存到后台的schema数据
// NOTE 问：既然模型的getSchema方法内部由getModelSchema实现，那为什么getModelSchema方法内部没有直接递归调用，而且继续调用下一级模型的getShema方法？
// NOTE 答：因为内部递归不可拦截(复写)，无法满足个别模型有特殊的getSchema实现。所以，纠正一下，不是所有的getSchema方法都是标准的
export const getModelSchema = (node, option = { normalKeys: [], deepKeys: [], refKeys: [], copy: Boolean }) => {
	const { normalKeys = node.normalKeys || [], deepKeys = node.deepKeys || [], refKeys = node.refKeys || [], copy = false } = option;

	const typeName = getType(node).name;
	// NOTE 修改这个值，在对应type类使用断点调试
	const debugTypeName = '';
	if (debugTypeName) {
		console.log('typeName', typeName);
		if (typeName === debugTypeName) {
			// debugger
		}
	}

	const schema = {} as any;
	normalKeys.forEach((key) => {
		if (copy && key === 'id') {
			schema.id = uuid();
		} else if (node[key] && isFunction(node[key].toJSON)) {
			schema[key] = node[key].toJSON();
		} else {
			schema[key] = node[key];
		}
	});

	deepKeys.forEach((key) => {
		// console.log('~~~~', key)
		// if (key === 'observer') {
		//   debugger
		// }
		if (isDef(node[key])) {
			if (isFunction(node[key].map)) {
				// 数组类型
				schema[key] = node[key].map((child) => {
					if (isFunction(child.getSchema)) {
						return child.getSchema(option);
					}
					// log.warn('getSchema is not a function on child object: ', child)
					return undefined;
				});
				// console.log('~~~~~~ schema', schema)
			} else if (isMapType(getType(node[key]))) {
				// Map类型
				schema[key] = {};
				node[key].forEach((item, id) => {
					if (isFunction(item.getSchema)) {
						// NOTE: Map类型替换id时单独做处理，所以这里始终不替换id
						schema[key][id] = item.getSchema({
							...option,
							copy: false,
						});
					} else {
						schema[key][id] = item;
					}
				});
			} else {
				if (isFunction(node[key].getSchema)) {
					schema[key] = node[key].getSchema(option);
				} else {
					console.warn("getSchema is not a function on object. Function: 'getModelSchema'", node[key]);
				}
			}
		} else {
			console.warn(`${key} is not found on node(${typeName}). Function: 'getModelSchema'`, node);
		}
	});
	refKeys.forEach((key) => (schema[key] = node[key] ? node[key].id : undefined));

	if (debugTypeName) {
		console.log(`getModelSchema(${typeName})`, JSON.stringify(schema, null, 4));
	}

	return schema;
};

export const setModelSchema = (node, schema) => {
	if (!schema) {
		return;
	}

	const typeName = getType(node).name;

	// NOTE 修改这个值，就可以查看对应type类的schema，或加入debugger断点
	const debugTypeName = '';
	if (debugTypeName) {
		if (typeName === debugTypeName) {
			console.log(typeName, 'schema', JSON.stringify(schema, null, 4));
		}
	}

	if (isArray(node.normalKeys)) {
		node.normalKeys.forEach((key) => {
			try {
				// // NOTE 临时能用
				// if (['width', 'height'].indexOf(key) > -1 && schema[key] == null) {
				//   schema[key] = -1
				// }

				node[key] = schema[key];
			} catch (error) {
				console.error(error, schema[key]);
			}
		});
	}

	if (isArray(node.deepKeys)) {
		node.deepKeys.forEach((key) => {
			// console.log('key🌈', key)
			// if (key === 'responserRoles') {
			//   console.log('node[key]', node[key])
			//   console.log('schema[key]', schema[key])
			// }
			if (isDef(node[key])) {
				// NOTE 经验 模型节点，使用isArray检测是不是数组即可，使用isArrayType返回的是false
				if (isArray(schema[key]) && isArray(node[key])) {
					node[key] = []; // NOTE 给数组setSchema的时候需要先清掉原来的值
					schema[key].forEach((itemSchema) => {
						node[key].push({ id: itemSchema.id });
						node[key][node[key].length - 1].setSchema(itemSchema);
					});
				} else if (isPlainObject(schema[key]) && isMapType(getType(node[key]))) {
					node[key].setSchema(schema[key]);
				} else {
					if (isFunction(node[key].setSchema)) {
						node[key].setSchema(schema[key]);
					} else {
						console.warn("setSchema is not a function on object. Function: 'setModelSchema'", node[key]);
					}
				}
			} else {
				console.warn(`deepKey(${key}) property is not found on node(${typeName}). Function: 'setModelSchema'`);
			}
		});
	}

	if (isArray(node.refKeys)) {
		node.refKeys.forEach((key) => {
			node[key] = schema[key];
		});
	}

	// TODO 文档 从 afterCreate 切换到 afterSetSchema 的原因及重要性
	// 原因及重要性：afterCreate只保障的id值的完成了初始化，不能保障所有props值都完成初始化
	if (isFunction(node.afterSetSchema)) {
		node.afterSetSchema();
	}
};

export const clearModelSchema = (model) => {
	if (isArray(model.deepKeys)) {
		model.deepKeys.forEach((key) => {
			if (isDef(model[key])) {
				destroy(model[key]);
			} else {
				console.warn(`${key} is not found on model node:`, model);
			}
		});
	}

	if (isArray(model.refKeys)) {
		model.refKeys.forEach((key) => {
			if (isDef(model[key])) {
				destroy(model[key]);
			} else {
				console.warn(`${key} is not found on node:`, model);
			}
		});
	}
};

// NOTE 对于MItemModel的约定
// * 必须有id
// * 定义了ctime属性，才会有self.revertList排序数组可用
// * 应该有isNew属性，待落地规范
// NOTE 经验，为什么不直接使用map对象？
// * 因为调用的时候提示必须使用action
// * box2.create({id: xxx, name: xxx}) vs box2.set(id, {id: xxx, name: xxx}), id需要提取出来
export const createManagerModel = (name, MItemModel) => {
	let MManager = types
		.model(name, {
			// 存放成员列表
			map: types.optional(types.map(MItemModel), {}),
			deepKeys: types.frozen(['map']),
		})
		.views((self) => ({
			get list() {
				return [...self.map];
			},
		}))
		.actions(commonAction(['getSchema', 'dumpSchema']))
		.actions((self) => {
			// NOTE 如果props不包含id，则使用内置的uuid生成id
			// NOTE props也可以传入其他希望有初始值的属性即可
			// NOTE ctime，isNew是内置处理
			const create = (props) => {
				const id = props && props.id ? props.id : uuid();
				self.map.set(id, {
					id,
					ctime: Date.now(),
					isNew: true,
					...props,
				});

				// create之后经常直接要用到实例
				return self.map.get(id);
			};

			// NOTE 根据id删除 或 根据成员删除(在jsx里可以省去 `.id`) 都支持
			const remove = (itemOrId) => {
				self.map.delete(isString(itemOrId) ? itemOrId : itemOrId.id);
			};

			const get = (id) => {
				return self.map.get(id);
			};

			const setSchema = (schema) => {
				if (schema && schema.map) {
					Object.entries(schema.map).forEach(([id, itemSchema]: any) => {
						// const itemModel = MItemModel.create({id: itemSchema.id})
						// console.warn(id, itemSchema)
						self.map.set(id, { id: itemSchema.id });
						setModelSchema(self.map.get(id), itemSchema);
					});
				}
			};

			return {
				create,
				remove,
				get,
				setSchema,
			};
		});

	const { properties } = getPropertyMembers(MItemModel);
	if (isDef(properties.ctime)) {
		MManager = MManager.views((self) => ({
			get revertList() {
				return self.list.sort((r1, r2) => r2[1].ctime - r1[1].ctime);
			},
		}));
		// log.warn(`'ctime' is not defined for param MItemModel(${modelName}) when calling 'createManagerModel(name, MItemModel)', so it will work nothing when use 'revertList'`)
	}

	return MManager;
};
