import React, { useState } from 'react';
import { Header } from '@/layouts/header';
import { BrowserRouter } from 'react-router-dom';
import Router from '@/routers/index';
import { ConfigProvider } from 'antd';
import 'moment/dist/locale/zh-cn';

function App() {
	return (
		<BrowserRouter>
			<div className="App">
				<Header />
				<Router />
			</div>
		</BrowserRouter>
	);
}

export default App;
