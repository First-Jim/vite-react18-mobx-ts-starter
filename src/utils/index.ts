import history from './history';

/**
 * 是个有效值
 * @param v
 */
function isDef(v) {
	return v !== undefined && v !== null;
}

export { history, isDef };
