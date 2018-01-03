const shell = require('shelljs')

let running = false;
module.exports = (interval) => {
	if (running) return;
	interval = interval || '* */12 * * *';
	running = true;
	if (shell.which('git')) {
		const cron = require('node-cron');
		const valid = cron.validate(interval);
		if (!valid) {
			return console.error("Updater: invalid interval", interval)
		}
		if (!process.env.name) {
			return console.error('Updater: Pm2 is not found');
		}
		cron.schedule(interval, () => {
			let res;
		res = shell.exec('git pull');
		if (res.code !== 0) {
			return console.error('Updater: Git pull failed');
		}
		if (res.stdout.indexOf("up-to-date") === -1) {
			res = shell.exec(`npm install`);
			if (res.code !== 0) {
				return console.error('Updater: npm install failed');
			}

			res = shell.exec(`pm2 restart ${process.env.name}`);
			if (res.code !== 0) {
				return console.error('Updater: Pm2 restart failed');
			}
			console.log("Updater: Updated and restarted")
		}
	});
	}
};