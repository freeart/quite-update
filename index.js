let running = false;
module.exports = (setup, cb) => {
	setup = setup || {}
	setup.interval = setup.interval || '0 */6 * * *';

	const shell = require('shelljs');
	shell.config.silent = true;

	if (!shell.which('git')) {
		return cb && setImmediate(() => cb("git is not found", {status: null}));
	}

	if (running) return;
	if (process.env.exec_mode == "cluster_mode" && process.env[process.env.instance_var] > 0) return;

	running = true;

	const cron = require('cron');

	const task = new cron.CronJob({
		cronTime: setup.interval,
		onTick: () => {
			let res;

			if (setup.strategy == "reset") {
				res = shell.exec('git reset --hard');
				if (res.code !== 0) {
					return cb && setImmediate(() => cb(res, {task, status: 'GIT RESET FAULT'}));
				}
			}
			res = shell.exec('git pull');
			if (res.code !== 0) {
				return cb && setImmediate(() => cb(res, {task, status: 'GIT PULL FAULT'}));
			}
			if (res.stdout.replace("-", " ").indexOf("up to date") === -1) {
				res = shell.exec(`npm install`);
				if (res.code !== 0) {
					return cb && setImmediate(() => cb(res, {task, status: 'NPM INSTALL FAULT'}));
				}

				res = shell.exec(`npm update`);
				if (res.code !== 0) {
					return cb && setImmediate(() => cb(res, {task, status: 'NPM UPDATE FAULT'}));
				}

				return process.exit(0);
			}
			cb && setImmediate(() => cb(null, {task, status: 'NO UPDATES'}));
		},
		start: true
	});
	cb && setImmediate(() => cb(null, {task, status: "RUNNING"}))
};