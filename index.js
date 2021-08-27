const { Plugin } = require('@vizality/entities');
const { patch, unpatch } = require('@vizality/patcher');
const { getModule, React } = require('@vizality/webpack');
const settings = require('./Components/Settings');

module.exports = class BlurNSFW extends Plugin {
	start() {
		this.injectStyles('style.css');
		vizality.api.settings.registerSettings(this.entityID, {
			category: this.entityID,
			label: 'Blur NSFW',
			render: settings,
		});
		this.patchBlur();
	}

	stop() {
		vizality.api.settings.unregisterSettings(this.entityID);
		unpatch('pog-blurnsfw');
	}

	blurChannel() {
		const blur = this.settings.get('blurEffect', 10);
		const timing = this.settings.get('blurTiming', 1);
		var element = document.querySelector('.scrollerInner-2YIMLh');
		if (element === null) return;
		element.style.setProperty('--blur-effect', `blur(${blur}px)`);
		element.style.setProperty('--blur-timing', `${timing}s`);
		element.classList.add('blur');
	}

	async patchBlur() {
		const channelTextArea = await getModule(m => m.type && m.type.render && m.type.render.displayName === 'ChannelTextAreaContainer', false);
		patch('pog-blurnsfw', channelTextArea.type, 'render', (args, res) => {
			const channel = args[0].channel;
			if ((this.settings.get('blurInDm') && channel.type === 1) || (this.settings.get('blurInGroup') && channel.type === 3)) this.blurChannel();
			else if (channel.nsfw && channel.type === 0) this.blurChannel();
			return res;
		});
		channelTextArea.type.render.displayName = 'ChannelTextAreaContainer';
	}
};