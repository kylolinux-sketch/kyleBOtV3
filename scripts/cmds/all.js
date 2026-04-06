module.exports = {
	config: {
		name: "all",
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			fr: "Tague tous les membres du groupe de discussion",
			en: "Tag all members in your group chat"
		},
		category: "box chat",
		guide: {
			fr: "   {pn} [texte à envoyer | laisser vide pour '@all']",
			en: "   {pn} [content | empty]"
		}
	},

	onStart: async function ({ message, event, args }) {
		const { participantIDs } = event;
		const totalMembres = participantIDs.length;
		const mentions = [];
		let texte = args.join(" ") || "@all";
		let texteLength = texte.length;
		let i = 0;

		for (const uid of participantIDs) {
			let fromIndex = 0;
			if (texteLength < totalMembres) {
				texte += texte[texteLength - 1];
				texteLength++;
			}
			if (texte.slice(0, i).lastIndexOf(texte[i]) != -1)
				fromIndex = i;
			mentions.push({
				tag: texte[i],
				id: uid, 
				fromIndex
			});
			i++;
		}

		message.reply({ body: texte, mentions });
	}
};
