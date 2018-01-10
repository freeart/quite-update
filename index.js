let running = false;
module.exports = (setup, cb) => {
	setup = setup || {}
	setup.interval = setup.interval || '0 */6 * * *';

	if (!process.env.name) {
		return cb && setImmediate(() => cb("pm2 is not found", {status: null}));
	}

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
		cronTime: interval,
		onTick: () => {
			let res;

			if (setup.strategy == "reset") {
				res = shell.exec('git reset --hard');
				if (res.code !== 0) {
					return cb && setImmediate(() => cb(res, {task, status: -1}));
				}
			}
			res = shell.exec('git pull');
			if (res.code !== 0) {
				return cb && setImmediate(() => cb(res, {task, status: -2}));
			}
			if (res.stdout.indexOf("up-to-date") === -1) {
				res = shell.exec(`npm install`);
				if (res.code !== 0) {
					return cb && setImmediate(() => cb(res, {task, status: -3}));
				}

				res = shell.exec(`pm2 restart ${process.env.name}`);
				if (res.code !== 0) {
					return cb && setImmediate(() => cb(res, task));
				}
			}
			cb && setImmediate(() => cb(null, {task, status: 2}));
		},
		start: true
	});
	cb && setImmediate(() => cb(null, {task, status: 1}))
};