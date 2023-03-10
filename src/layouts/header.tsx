import styled from 'styled-components';
import { UserInfo } from '@/components';

import { observer } from 'mobx-react-lite';
import { Layout } from 'antd';

const { Header: AntHeader } = Layout;

const StyledHeader = styled(AntHeader)`
	display: flex;
	height: 48px;
	line-height: 48px;
	background-color: #000;

	> .left {
		display: flex;
		color: white;

		> .logo {
			cursor: pointer;

			img {
				height: 36px;
			}
		}

		> .company-name {
			margin-left: 32px;
			font-size: 16px;
		}
		> .point {
			cursor: pointer;
		}
	}

	> .right {
		display: flex;
		align-items: center;
		margin-left: auto;
		color: #999;

		.anticon {
			font-size: 16px;
			margin: 4px;

			&.active {
				color: ${(props) => props.theme.primaryColor};
			}
		}

		> div {
			cursor: pointer;
			height: 100%;
			padding: 0 10px;

			&:hover {
				background: rgba(0, 88, 267, 0.15);
				color: white;
			}
		}

		> div.console {
			text-align: center;
			font-size: 19px;
			box-sizing: border-box;
			width: 44px;
		}
	}
`;

type Props = {
	className?: string;
};

export const Header = observer(function Header({ className = '' }: Props) {
	return (
		<StyledHeader className={className}>
			<div className="left">
				<div className="logo">
					<img src={'https://images.pexels.com/photos/3689532/pexels-photo-3689532.jpeg?auto=compress&cs=tinysrgb&w=1600'} alt="logo" />
				</div>
			</div>
			<div className="right">
				<UserInfo type="portal" />
			</div>
		</StyledHeader>
	);
});
