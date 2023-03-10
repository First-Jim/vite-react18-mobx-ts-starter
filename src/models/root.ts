import { types } from 'mobx-state-tree';
import { MLayerManager } from './layer';

const MRoot = types
	.model('MRoot', {
		layerManager: types.optional(MLayerManager, {}),
	})
	.actions((self) => ({
		afterCreate() {
			// 创建tooltip的layer实例
			self.layerManager.create({
				id: 'tooltip',
				width: 180,
				liveTitle: true,
			});

			// 创建右键菜单的layer实例
			self.layerManager.create({
				id: 'contextMenu',
				width: 100,
			});

			// 创建全局提示的layer实例
			self.layerManager.create({
				id: 'globalTip',
				top: 60,
				width: 560,
				height: 48,
			});

			// // 当点击layer以外的地方时，触发globalClick全局点击事件，关闭所有layer
			// document.body.addEventListener('click', (e) => {
			// 	if (e.target && e.target.closest('.stopPropagation') === null) {
			// 		globalEvent.fire('MLayerManager.globalClick', self.layerManager);
			// 	}
			// });
			// document.addEventListener('keydown', (e) => {
			// 	switch (e.keyCode) {
			// 		case 27:
			// 			self.rightMenu.set('isFullScreen', false);
			// 			break;
			// 		// S键
			// 		default:
			// 			break;
			// 	}
			// });
		},
	}));

export default MRoot;
