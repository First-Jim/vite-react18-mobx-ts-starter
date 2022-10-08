import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/reset.less';
import App from './App';
import 'antd/dist/antd.css';
import 'virtual:svg-icons-register';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
