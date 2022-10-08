/*!
 * Copyright (C) 2016-present, Yuansuan.cn
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Dropdown, Menu } from 'antd';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { history } from '@/utils';

const StyledMenu = styled(Menu)`
	.ant-dropdown-menu-item,
	.ant-dropdown-menu-submenu-title {
		padding: 8px 20px;
		color: #666;

		a {
			color: #666;
		}
	}
	.ant-dropdown-menu-item {
		> * {
			display: flex;
			align-items: center;
		}
	}
`;

const StyledUserInfo = styled.div`
	display: flex;
	align-items: center;
	padding: 0 10px;

	> .username {
		margin-left: 4px;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`;

type Props = {
	type?: 'portal' | 'inside';
};

export const UserInfo = observer(function UserInfo({ type = 'inside' }: Props) {
	const navigate = useNavigate();

	const state = useLocalObservable(() => ({
		open: false,
		setOpen(flag) {
			this.open = flag;
		},
	}));

	const MenuList = [
		{
			key: '/logout',
			label: '退出登录',
			onClick: () => {
				navigate('/logout');
			},
		},
	];

	const onClick = (MenuItem) => {
		history.push(MenuItem.key);
	};
	return (
		<Dropdown open={state.open} onOpenChange={(open) => state.setOpen(open)} overlay={<Menu items={MenuList} onClick={onClick}></Menu>} placement="bottom">
			<StyledUserInfo id="ys_header_user_menu">
				<div className="username" title={'--'}>
					{'--'}
				</div>
			</StyledUserInfo>
		</Dropdown>
	);
});
