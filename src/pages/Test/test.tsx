import React, { useRef, useState, Children } from 'react';
import { observer } from 'mobx-react-lite';
import './test.less';
import root from '@/models';

export default observer(() => {
	const button = useRef(null);
	return (
		<div className="test">
			<span
				className="contextMenu"
				onContextMenu={() => {
					root.layerManager.get('contextMenu').show({
						list: [
							{
								name: '查看个人档案详情',
								action: () => {
									console.log('查看个人档案详情');
								},
							},
							{
								name: '查看个人常用落脚点',
								action: () => {
									console.log('查看个人常用落脚点');
								},
								disabled: true,
							},
							{
								name: '预测2小时后的位置',
								action: () => {
									console.log('预测2小时后的位置');
								},
							},
						],
					});
				}}
			>
				右键菜单使用
			</span>
		</div>
	);
});
