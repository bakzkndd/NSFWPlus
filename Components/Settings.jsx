const { getModule, React } = require('@vizality/webpack');
const { SwitchItem, SliderInput, Category } = require('@vizality/components/settings');
const { patch, unpatch } = require('@vizality/patcher');
let blockedChannels = Array(),
	blurChannels = Array();

module.exports = class Blur extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = { category0Opened: false, category1Opened: false };
	}
	render() {
		const { getSetting, toggleSetting, updateSetting } = this.props;
		(blockedChannels = getSetting('Blocked')), (blurChannels = getSetting('Blur'));
		if (blockedChannels === undefined || blockedChannels === null) blockedChannels = [{ id: 'Enter a channel/user id' }];
		if (blurChannels === undefined || blurChannels === null) blurChannels = [{ id: 'Enter a channel/user id' }];
		return (
			<>
				<SwitchItem note="Blur images in dms" value={getSetting('blurInDm', false)} onChange={() => toggleSetting('blurInDm')}>
					DM
				</SwitchItem>
				<SwitchItem note="Blur images in group chats" value={getSetting('blurInGroup', false)} onChange={() => toggleSetting('blurInGroup')}>
					Group Chat
				</SwitchItem>
				<SliderInput
					stickToMarkers
					minValue={1}
					maxValue={50}
					initialValue={getSetting('blurEffect', 10)}
					markers={[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
					onValueChange={change => updateSetting('blurEffect', change)}
				>
					Blur Effect
				</SliderInput>
				<SliderInput
					stickToMarkers
					minValue={0.2}
					maxValue={10}
					initialValue={getSetting('blurTiming', 1)}
					markers={[0.2, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
					onValueChange={change => updateSetting('blurTiming', change)}
				>
					Blur Timing (in seconds)
				</SliderInput>
				<SwitchItem note="NSFW Tags by Channels" value={getSetting('NSFWTags', true)} onChange={() => {
					toggleSetting('NSFWTags')
					if(!getSetting('NSFWTags')) {
						unpatch('NSFWtags');
						document.querySelectorAll('.nsfw-badge').forEach(e => e.remove());
					} else {
						const ChannelItem = getModule(m => m.default && m.default.displayName == 'ChannelItem', false);

						patch('NSFWtags', ChannelItem, 'default', (_, props) => {
							const children = props.props.children.props.children[1].props.children[1].props.children;
							const channel = children[1].props.channel;
							if (!channel.nsfw) return props;
							children.unshift(React.createElement('div', { className: 'nsfw-badge' }, React.createElement('div', { className: 'nsfw-text' }, 'NSFW')));
							return props;
						});
						ChannelItem.default.displayName = 'ChannelItem';
					}
				}}>
					NSFW Tags
				</SwitchItem>
				<p style={{ color: '#b9bbbe' }}>(you will need to switch channel/dm for any changes to take effect)</p>
			</>
		);
	}
};