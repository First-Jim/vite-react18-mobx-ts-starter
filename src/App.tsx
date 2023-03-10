import React, { useState } from 'react';
import { Header } from '@/layouts/header';
import { BrowserRouter } from 'react-router-dom';
import Router from '@/routers/index';
import { ErrorBoundary } from 'react-error-boundary';
import { ConfigProvider } from 'antd';
import 'moment/dist/locale/zh-cn';

function ErrorFallback({ error, resetErrorBoundary }) {
	return (
		<div style={{ margin: '100px auto', textAlign: 'center' }}>
			<meta charSet="UTF-8" />
			<title>404 - Page</title>
			<div id="page">
				<div id="container">
					<h2>Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</h2>
					<div id="details">
						<div id="stopcode">
							<h5>
								If you call a support person, give them this info:
								<br />
								Stop Code: {error.message}
							</h5>
							<button onClick={resetErrorBoundary}>Try again</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
function App() {
	return (
		<BrowserRouter>
			<div className="App">
				<ErrorBoundary FallbackComponent={ErrorFallback}>
					<Header />
					<Router />
				</ErrorBoundary>
			</div>
		</BrowserRouter>
	);
}

export default App;
