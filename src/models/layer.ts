import { types, getParent } from 'mobx-state-tree';
import isFunction from 'lodash/isFunction';
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';
import isPlainObject from 'lodash/isPlainObject';
import { isDef } from '@/utils';
import { commonAction, createManagerModel } from './util';
export const MLayer = types
	.model('MLayer', {
		id: types.identifier,
		top: types.maybe(types.number),
		right: types.maybe(types.number),
		bottom: types.maybe(types.number),
		left: types.maybe(types.number),
		width: types.maybe(types.number),
		height: types.maybe(types.number),
		autoHeight: types.maybe(types.number),
		isVisible: types.optional(types.boolean, false),
		closable: types.optional(types.boolean, true),
		isFullscreen: types.optional(types.boolean, false),
		hideWhenOutsideClick: types.optional(types.boolean, true),
		attachToPosition: types.frozen(undefined),
		// children: types.frozen(undefined),
		content: types.frozen(undefined),
		type: types.optional(types.enumeration(['normal']), 'normal'),
		// menu/keyValue的数据列表
		list: types.frozen([]),
		// 静态标题，layerManager.create的时候初始化一次即可
		title: types.maybe(types.string),
		// 是否是动态标题，如果是，在hide的时候需要将title恢复到undefined
		liveTitle: types.optional(types.boolean, false),
		// 标题icon
		icon: types.maybe(types.string),
		debug: types.optional(types.boolean, false),
	})
	.views((self: any) => ({
		get style() {
			const hiddenTop = self.debug ? 100 : -1000000;
			const hiddenLeft = self.debug ? 100 : -1000000;
			const style = {} as any;
			style.width = self.width;

			style.height = self.height;
			// 是否可见
			if (self.isVisible) {
				if (self.attachToPosition) {
					if (!self.hasWidth) {
						throw new Error('Layer组件的attachToPosition属性有值，则必须同时传入width属性');
					}

					// 如果指定了吸附元素，则忽略top, right, bottom, left, width, isFullScreen
					const { left: elementLeft, top: elementTop, bottom: elementBottom, right: elementRight } = self.attachToPosition;
					// console.log('elementRef.current.getBoundingClientRect()', elementRef.current.getBoundingClientRect())

					const windowWidth = window.innerWidth;
					const windowHeight = window.innerHeight;

					if (elementLeft + self.width > windowWidth) {
						style.left = undefined;
						style.right = windowWidth - elementRight;
					} else {
						style.left = elementLeft;
						style.right = undefined;
					}

					if (isDef(self.autoHeight)) {
						// 触发元素之下的空间放不下
						if (elementBottom + self.autoHeight > windowHeight) {
							// 触发元素之上的空间也放不下
							if (self.autoHeight > elementTop) {
								// 触发元素之下的空间更大一些，放下面
								if (windowHeight - elementBottom > elementTop) {
									style.top = elementBottom;
									style.bottom = 10;
								} else {
									style.top = 10;
									style.bottom = windowHeight - elementTop;
								}
							} else {
								style.top = undefined;
								style.bottom = windowHeight - elementTop;
							}
						} else {
							style.top = elementBottom;
							style.bottom = undefined;
						}
					}
				} else if (self.isFullScreen) {
					style.width = '100%';
					style.height = '100%';
					style.top = 0;
					style.left = 0;
					style.bottom = 0;
					style.right = 0;
				} else {
					style.width = self.hasLeft && self.hasRight ? 'auto' : `${self.width}px`;
					style.height = self.hasTop && self.hasBottom ? 'auto' : `${self.height}px`;
					style.top = self.hasTop ? `${self.top}px` : self.hasBottom && self.hasHeight ? 'auto' : '50%';
					style.left = self.hasLeft ? `${self.left}px` : self.hasRight && self.hasWidth ? 'auto' : '50%';
					style.bottom = self.hasBottom ? `${self.bottom}px` : 'auto';
					style.right = self.hasRight ? `${self.right}px` : 'auto';

					// 补充
					if (style.top === '50%') {
						style.transform = 'translateY(-50%)';
					}

					// 补充
					if (style.left === '50%') {
						style.transform = `${style.transform || ''} translateX(-50%)`;
					}
				}
			} else {
				style.top = hiddenTop;
				style.left = hiddenLeft;
				style.right = undefined;
				style.bottom = undefined;
			}

			// console.log('style', JSON.stringify(style, null, 4))
			return style;
		},
		get hasTop() {
			return isDef(self.top);
		},
		get hasRight() {
			return isDef(self.right);
		},
		get hasBottom() {
			return isDef(self.bottom);
		},
		get hasLeft() {
			return isDef(self.left);
		},
		get hasWidth() {
			return isDef(self.width);
		},
		get hasHeight() {
			return isDef(self.height);
		},
		get parent() {
			return getParent(self, 2);
		},
	}))
	.actions(commonAction(['set']))
	.actions((self: any) => {
		// 重置：仅内部使用
		const reset = () => {
			self.attachToPosition = undefined;
			self.isFullscreen = false;
			self.list = [];
			self.autoHeight = undefined;

			// 动态标题
			if (self.liveTitle) {
				self.title = undefined;
			}
			self.isVisible = false;
		};

		// attachTo每次可以是不一样的
		const show = ({ attachTo, list, title, icon, video, iframe, content, width, height, closable = true, right, bottom, left, top }) => {
			// TODO 待优化
			// 右键时阻止默认菜单弹出
			window.event && window.event.preventDefault();

			// NOTE layer可以独立运行，不都在manager里
			if (self.parent) {
				self.parent.hideAll();
			}

			reset();

			const { event }: any = window;

			if (attachTo) {
				if (isFunction(attachTo.getBoundingClientRect)) {
					// 如果attachTo是dom元素
					self.attachToPosition = attachTo.getBoundingClientRect();
				} else if (isPlainObject(attachTo)) {
					// 如果直接就是位置值
					self.attachToPosition = attachTo;
				}
			} else if (attachTo === false) {
				// 明确为false的情况暂时没有
			} else if (isDef(event)) {
				event.stopImmediatePropagation();

				const offset = 16;
				self.attachToPosition = {
					top: event.pageY + offset,
					bottom: event.pageY + offset,
					left: event.pageX + offset,
					right: event.pageX + offset,
				};
			}

			self.list = isFunction(list) ? list() : list;

			if (isDef(title)) {
				self.title = title;
			}

			if (isDef(icon)) {
				self.icon = icon;
			}

			if (isDef(video)) {
				self.video = video;
			}

			if (isDef(iframe)) {
				self.iframe = iframe;
			}

			if (isDef(content)) {
				self.content = content;
			}

			if (isNumber(width)) {
				self.width = width;
			}

			if (isNumber(height)) {
				self.height = height;
			}

			if (isNumber(right)) {
				self.right = right;
			}

			if (isNumber(bottom)) {
				self.bottom = bottom;
			}

			if (isNumber(left)) {
				self.left = left;
			}

			if (isNumber(top)) {
				self.top = top;
			}

			if (isBoolean(closable)) {
				self.closable = closable;
			}

			self.isVisible = true;
		};

		const hide = () => {
			reset();
		};

		const toggle = (props) => {
			if (self.isVisible) {
				self.hide();
			} else {
				self.show(props);
			}
		};

		return {
			show,
			hide,
			toggle,
		};
	});

export const MLayerManager = createManagerModel('MLayerManager', MLayer)
	.views((self) => ({
		// 所有可见的浮层
		get visibleList() {
			return self.list.filter(([layerId, layer]) => layer.isVisible);
		},
	}))
	.actions((self) => {
		const hideAll = () => {
			self.visibleList.forEach(([layerId, layer]) => {
				if (layer.hideWhenOutsideClick) {
					layer.hide();
				}
			});
		};

		return {
			hideAll,
		};
	});
