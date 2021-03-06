"use strict";

const SEASON_X = [ 893, 978, 1064, 1149 ];
const YEAR_X = { 1801: 175, 1802: 294, 1803: 413, 1804: 532, 1805: 652, 1806: 771 };
const YEAR_Y = 728;

function get_piece_id(name) {
	return PIECES.indexOf(name);
}

function get_space_id(name) {
	return SPACES.indexOf(name);
}

function create_piece_list(n, name) {
	let list = [];
	for (let i = 1; i <= n; ++i)
		list.push(get_piece_id(name + i));
	return list;
}

const US_FRIGATES = create_piece_list(8, 'us_frigate_');
const TR_FRIGATES = create_piece_list(2, 'tr_frigate_');
const FRIGATES = US_FRIGATES.concat(TR_FRIGATES);

const ALEXANDRIA = get_space_id("Alexandria");
const ALGIERS = get_space_id("Algiers");
const ALGIERS_PATROL_ZONE = get_space_id("Algiers Patrol Zone");
const BENGHAZI = get_space_id("Benghazi");
const DERNE = get_space_id("Derne");
const GIBRALTAR = get_space_id("Gibraltar");
const GIBRALTAR_PATROL_ZONE = get_space_id("Gibraltar Patrol Zone");
const MALTA = get_space_id("Malta");
const TANGIER = get_space_id("Tangier");
const TANGIER_PATROL_ZONE = get_space_id("Tangier Patrol Zone");
const TRIPOLI = get_space_id("Tripoli");
const TRIPOLI_PATROL_ZONE = get_space_id("Tripoli Patrol Zone");
const TUNIS = get_space_id("Tunis");
const TUNIS_PATROL_ZONE = get_space_id("Tunis Patrol Zone");
const UNITED_STATES_SUPPLY = get_space_id("United States Supply");
const TRIPOLITAN_SUPPLY = get_space_id("Tripolitan Supply");
const TRACK_1801 = get_space_id("1801");
const TRACK_1802 = get_space_id("1802");
const TRACK_1803 = get_space_id("1803");
const TRACK_1804 = get_space_id("1804");
const TRACK_1805 = get_space_id("1805");
const TRACK_1806 = get_space_id("1806");

const US_CARD_NAMES = [
	"Thomas Jefferson",
	"Swedish Frigates Arrive",
	"Hamet\u{2019}s Army Created",
	"Treaty of Peace and Amity",
	"Assault on Tripoli",
	"Naval Movement",
	"Naval Movement",
	"Naval Movement",
	"Naval Movement",
	"Early Deployment",
	"A Show of Force",
	"Tribute Paid",
	"Constantinople Demands Tribute",
	"Hamet Recruits Bedouins",
	"Bainbridge Supplies Intel",
	"Congress Authorizes Action",
	"Corsairs Confiscated",
	"Burn the Philadelphia",
	"Launch the Intrepid",
	"General Eaton Attacks Derne",
	"General Eaton Attacks Benghazi",
	"Lieutenant Sterett in Pursuit",
	"Preble\u{2019}s Boys Take Aim",
	"The Daring Stephen Decatur",
	"Send in the Marines",
	"Lieutenant O'Bannon Leads the Charge",
	"Marine Sharpshooters",
];

const TR_CARD_NAMES = [
	"Yusuf Qaramanli",
	"Murad Reis Breaks Out",
	"Constantinople Sends Aid",
	"US Supplies Run Low",
	"Algerine Corsairs Raid",
	"Algerine Corsairs Raid",
	"Moroccan Corsairs Raid",
	"Moroccan Corsairs Raid",
	"Tunisian Corsairs Raid",
	"Tunisian Corsairs Raid",
	"Troops to Derne",
	"Troops to Benghazi",
	"Troops to Tripoli",
	"Storms",
	"Tripoli Attacks",
	"Sweden Pays Tribute",
	"Tripoli Acquires Corsairs",
	"The Philadelphia Runs Aground",
	"Algiers Declares War",
	"Morocco Declares War",
	"Tunis Declares War",
	"US Signal Books Overboard",
	"Uncharted Waters",
	"Merchant Ship Converted",
	"Happy Hunting",
	"The Guns of Tripoli",
	"Mercenaries Desert",
];

let ui = {
	spaces: {},
	pieces: {},
	gold: [],
	cards: {},
}

function sub_log_entry_tip(match, p1, offset, string) {
	let card_number;
	card_number = US_CARD_NAMES.indexOf(p1) + 1;
	if (card_number > 0)
		return `\n<span class="us_tip" onmouseenter="on_focus_card_tip('us_card_${card_number}')" onmouseleave="on_blur_card_tip()">${p1}</span>`;
	card_number = TR_CARD_NAMES.indexOf(p1) + 1;
	if (card_number > 0)
		return `\n<span class="tr_tip" onmouseenter="on_focus_card_tip('tr_card_${card_number}')" onmouseleave="on_blur_card_tip()">${p1}</span>`;
	return match;
}

function sub_log_entry_tip2(match, p1, offset, string) {
	let card_number = p1 | 0;
	if (card_number < 28)
		return `\n<span class="us_tip" onmouseenter="on_focus_card_tip('us_card_${card_number}')" onmouseleave="on_blur_card_tip()">${US_CARD_NAMES[card_number-1]}</span>`;
	else
		return `\n<span class="tr_tip" onmouseenter="on_focus_card_tip('tr_card_${card_number-27}')" onmouseleave="on_blur_card_tip()">${TR_CARD_NAMES[card_number-28]}</span>`;
	return match;
}

let last_log_who = 'st';
function on_log(text) {
	let p = document.createElement("div");
	text = text.replace(/&/g, "&amp;");
	text = text.replace(/</g, "&lt;");
	text = text.replace(/>/g, "&gt;");
	text = text.replace(/\u201c(.*)\u201d/g, sub_log_entry_tip);
	text = text.replace(/#(\d+)/g, sub_log_entry_tip2);
	if (text.match(/^Start of \d+/)) {
		text = text.substring(9, text.length-1);
		p.className = 'year';
	} else if (text.match(/^Start of /)) {
		text = text.substring(9, text.length-1);
		p.className = 'season';
	} else if (text.match(/^.year \d+/)) {
		text = text.substring(6);
		p.className = 'year';
	} else if (text.match(/^.season /)) {
		text = text.substring(8);
		p.className = 'season';
	} else if (text.match(/^Pirate raid from/)) {
		p.className = 'raid';
	} else if (text.match(/^(Naval|Land) (battle|bombardment) in/)) {
		p.className = 'battle';
	} else if (text.match(/^(Naval|Land) battle (round)/)) {
		p.className = 'round';
	} else if (text.match(/(victory:|ends in a draw)/)) {
		p.className = 'end';
	}
	p.innerHTML = text;
	return p;
}

function on_focus_card_tip(card_name) {
	document.getElementById("tooltip").classList = "card show " + card_name;
}

function on_blur_card_tip() {
	document.getElementById("tooltip").classList = "card";
}

function on_focus_space(evt) {
	let where = SPACES[evt.target.space];
	document.getElementById("status").textContent = where;
}

function on_focus_piece(evt) {
	let who = PIECES[evt.target.piece];
	document.getElementById("status").textContent = who;
}

function on_blur(evt) {
	document.getElementById("status").textContent = "";
}

function on_click_space(evt) { send_action('space', evt.target.space); }
function on_click_piece(evt) { send_action('piece', evt.target.piece); }

function on_focus_active_card(evt) {
	if (typeof view.card === 'number') {
		if (view.card < 27)
			document.getElementById("tooltip").className = "card show us_card_" + view.card;
		else
			document.getElementById("tooltip").className = "card show tr_card_" + (view.card-27);
	}
}

function on_blur_active_card(evt) {
	document.getElementById("tooltip").classList = "card";
}

function build_map() {
	let map = document.getElementById("svgmap");
	for (let i = 0; i < SPACES.length; ++i) {
		let space = SPACES[i];
		let id = space.replace(/ /g, "_").toLowerCase();
		let e = map.getElementById(id);
		if (e) {
			e.addEventListener("mouseenter", on_focus_space);
			e.addEventListener("mouseleave", on_blur);
			e.addEventListener("click", on_click_space);
			e.space = i;
			ui.spaces[i] = e;
		}
	}
	for (let i = 0; i < PIECES.length; ++i) {
		let piece = PIECES[i];
		let e = document.getElementById(piece);
		if (e) {
			e.addEventListener("mouseenter", on_focus_piece);
			e.addEventListener("mouseleave", on_blur);
			e.addEventListener("click", on_click_piece);
			e.piece = i;
			ui.pieces[i] = e;
		}
	}
	for (let i = 1; i <= 12; ++i) {
		ui.gold.push(document.getElementById("gold_" + i));
	}
	for (let i = 1; i <= 27; ++i) {
		let e = ui.cards[i] = document.getElementById("us_card_"+i);
		e.addEventListener("click", on_click_card);
		e.card = i;
	}
	for (let i = 28; i <= 54; ++i) {
		let e = ui.cards[i] = document.getElementById("tr_card_"+(i-27));
		e.addEventListener("click", on_click_card);
		e.card = i;
	}
	document.getElementById("active_card").addEventListener("mouseenter", on_focus_active_card);
	document.getElementById("active_card").addEventListener("mouseleave", on_blur_active_card);
}

const CARD_ACTIONS = [
	'card_build_corsair',
	'card_build_gunboat',
	'card_event',
	'card_move_frigates',
	'card_pirate_raid',
	'card_take',
	'discard',
];

function is_card_enabled(c) {
	if (view.actions)
		for (let a of CARD_ACTIONS)
			if (view.actions[a] && view.actions[a].includes(c))
				return true;
	return false;
}

function update_card(c, show) {
	if (is_card_enabled(c))
		ui.cards[c].classList.add('enabled');
	else
		ui.cards[c].classList.remove('enabled');
	if (show)
		ui.cards[c].classList.add('show');
	else
		ui.cards[c].classList.remove('show');
}

function update_cards() {
	for (let i = 1; i <= 3; ++i) {
		update_card(i, view.core.includes(i));
		update_card(i+27, view.core.includes(i+27));
	}
	for (let i = 4; i <= 27; ++i) {
		update_card(i, view.hand.includes(i));
		update_card(i+27, view.hand.includes(i+27));
	}
}

/* MAP AND PIECE LAYOUT */

function tr_info() {
	let text = "";
	text += "Hand: " + view.tr.hand + " / ";
	text += "Draw: " + view.tr.draw + " / ";
	text += "Discard: " + view.tr.discard + "\n";
	return text;
}

function us_info() {
	let text = "";
	text += "Hand: " + view.us.hand + " / ";
	text += "Draw: " + view.us.draw + " / ";
	text += "Discard: " + view.us.discard + "\n";
	return text;
}

function on_update() {
	action_button("pass", "Pass");
	action_button("next", "Next");
	action_button("undo", "Undo");

	document.getElementById("tr_score").textContent = view.tr.score;
	document.getElementById("us_score").textContent = view.us.score;
	document.getElementById("tr_info").textContent = tr_info();
	document.getElementById("us_info").textContent = us_info();

	if (view.card === undefined)
		document.getElementById("active_card").className = "card show blank";
	else if (view.card === "United States")
		document.getElementById("active_card").className = "card show us_card_back";
	else if (view.card === "Tripolitania")
		document.getElementById("active_card").className = "card show tr_card_back";
	else if (view.card < 27)
		document.getElementById("active_card").className = "card show us_card_" + view.card;
	else
		document.getElementById("active_card").className = "card show tr_card_" + (view.card-27);

	update_year_marker(view.year);
	update_season_marker(view.season);
	update_gold();
	update_pieces();
	update_cards();
	update_spaces();
}

function update_year_marker(year) {
	let e = document.getElementById("year");
	e.style.left = Math.round(YEAR_X[year] - 27) + "px";
	e.style.top = Math.round(YEAR_Y - 27) + "px";
}

function update_season_marker(season) {
	let e = document.getElementById("season");
	e.style.left = Math.round(SEASON_X[season] - 27) + "px";
	e.style.top = Math.round(YEAR_Y - 27) + "px";
}

function set_piece_xy(p, x, y) {
	let e = ui.pieces[p];
	e.style.left = Math.round(x - e.offsetWidth/2) + "px";
	e.style.top = Math.round(y - e.offsetHeight/2) + "px";
}

function set_gold_xy(i, x, y) {
	let e = ui.gold[i];
	e.style.left = Math.round(x - e.offsetWidth/2) + "px";
	e.style.top = Math.round(y - e.offsetHeight/2) + "px";
}

function layout_space(location, s, x0, y0, size) {
	const LOUT_W = { se_f:46, us_f:46, tr_f:46, us_g:36, tr_c:36, al_c:36, us_m:28, ar_i:28, tr_i:28 };
	const LOUT_H = { se_f:32, us_f:32, tr_f:32, us_g:28, tr_c:28, al_c:28, us_m:28, ar_i:28, tr_i:28 };
	function lout(row, prefix) {
		row.w = LOUT_W[prefix];
		row.h = LOUT_H[prefix];
		return row;
	}

	let pps = { se_f:[], us_f:[], us_g:[], us_m:[], ar_i:[], tr_f:[], tr_c:[], al_c:[], tr_i:[] };
	for (let p = 0; p < PIECES.length; ++p) {
		if (location[p] === s) {
			let prefix = PIECES[p].substring(0,4);
			if (location[p] === TRIPOLITAN_SUPPLY && prefix === 'tr_f') prefix = 'us_f';
			if (prefix === 'se_f') prefix = 'us_f';
			if (prefix === 'al_c') prefix = 'tr_c';
			pps[prefix].push(p);
		}
	}

	let rows = [];
	for (let prefix in pps) {
		let row = pps[prefix];
		if (row.length > 0) {
			let wrap = (prefix === 'ar_i' || prefix === 'tr_i') ? size+1 : size;
			if (row.length > wrap*2) {
				rows.push(lout(row.slice(0,wrap), prefix))
				rows.push(lout(row.slice(wrap,wrap*2), prefix))
				rows.push(lout(row.slice(wrap*2), prefix))
			} else if (row.length > wrap) {
				rows.push(lout(row.slice(0,wrap), prefix))
				rows.push(lout(row.slice(wrap), prefix))
			} else {
				rows.push(lout(row, prefix));
			}
		}
	}

	let h = rows.reduce((acc, row) => acc + row.h, 0);
	let y = y0 - h / 2;
	for (let r = 0; r < rows.length; ++r) {
		let row = rows[r];
		let w = row.w * row.length;
		let x = x0 - w / 2 + row.w/2;
		for (let c = 0; c < row.length; ++c) {
			let p = row[c];
			set_piece_xy(p, x + c * row.w, y + row.h/2);
		}
		y += row.h;
	}
}

function update_pieces() {
	layout_space(view.location, UNITED_STATES_SUPPLY, 1933, 180, 5);
	layout_space(view.location, TRIPOLITAN_SUPPLY, 2195, 180, 6);

	layout_space(view.location, TRACK_1801, YEAR_X[1801], 625, 2);
	layout_space(view.location, TRACK_1802, YEAR_X[1802], 625, 2);
	layout_space(view.location, TRACK_1803, YEAR_X[1803], 625, 2);
	layout_space(view.location, TRACK_1804, YEAR_X[1804], 625, 2);
	layout_space(view.location, TRACK_1805, YEAR_X[1805], 625, 2);
	layout_space(view.location, TRACK_1806, YEAR_X[1806], 625, 2);

	layout_space(view.location, ALEXANDRIA, 2335, 454, 3);
	layout_space(view.location, ALGIERS, 883, 318, 3);
	layout_space(view.location, BENGHAZI, 1877, 583, 3);
	layout_space(view.location, DERNE, 2030, 437, 3);
	layout_space(view.location, GIBRALTAR, 374, 216, 3);
	layout_space(view.location, MALTA, 1592, 189, 3);
	layout_space(view.location, TANGIER, 296, 426, 3);
	layout_space(view.location, TRIPOLI, 1416, 604, 5);
	layout_space(view.location, TUNIS, 1232, 278, 3);

	layout_space(view.location, ALGIERS_PATROL_ZONE, 875, 170, 3);
	layout_space(view.location, GIBRALTAR_PATROL_ZONE, 560, 245, 3);
	layout_space(view.location, TANGIER_PATROL_ZONE, 125, 410, 3);
	layout_space(view.location, TRIPOLI_PATROL_ZONE, 1575, 420, 5);
	layout_space(view.location, TUNIS_PATROL_ZONE, 1300, 130, 3);

	for (let p of FRIGATES) {
		if (view.damaged.includes(p))
			ui.pieces[p].classList.add("damaged");
		else
			ui.pieces[p].classList.remove("damaged");
	}

	for (let p = 0; p < PIECES.length; ++p) {
		if (view.actions && view.actions.piece && view.actions.piece.includes(p))
			ui.pieces[p].classList.add("highlight");
		else
			ui.pieces[p].classList.remove("highlight");
	}
}

function update_gold() {
	let split = 12 - view.tr.gold;
	let x, y;
	x = 690;
	y = 50;
	for (let i = 0; i < split; ++i) {
		set_gold_xy(i, x, y);
		x += 50;
	}
	x = 2250;
	y = 750;
	for (let i = 11; i >= split; --i) {
		set_gold_xy(i, x, y);
		x -= 50;
	}
}

function update_spaces() {
	for (let space in ui.spaces) {
		ui.spaces[space].classList.remove('highlight');
		ui.spaces[space].classList.remove('where');
	}
	if (view.where !== null) {
		ui.spaces[view.where].classList.add('where');
	}
	if (view.actions && view.actions.space) {
		for (let space of view.actions.space) {
			ui.spaces[space].classList.add('highlight');
		}
	}
}

/* CARD ACTION MENU */

let current_popup_card = 0;

function show_popup_menu(evt, list) {
	document.querySelectorAll("#popup div").forEach(e => e.classList.remove('enabled'));
	for (let item of list) {
		let e = document.getElementById("menu_" + item);
		e.classList.add('enabled');
	}
	let popup = document.getElementById("popup");
	popup.style.display = 'block';
	popup.style.left = (evt.clientX-50) + "px";
	popup.style.top = (evt.clientY-12) + "px";
	ui.cards[current_popup_card].classList.add("selected");
}

function hide_popup_menu() {
	let popup = document.getElementById("popup");
	popup.style.display = 'none';
	if (current_popup_card) {
		ui.cards[current_popup_card].classList.remove("selected");
		current_popup_card = 0;
	}
}

function on_card_event() {
	if (send_action('card_event', current_popup_card))
		hide_popup_menu();
}

function on_card_take() {
	if (send_action('card_take', current_popup_card))
		hide_popup_menu();
}

function on_card_move_frigates() {
	if (send_action('card_move_frigates', current_popup_card))
		hide_popup_menu();
}

function on_card_pirate_raid() {
	if (send_action('card_pirate_raid', current_popup_card))
		hide_popup_menu();
}

function on_card_build_gunboat() {
	if (send_action('card_build_gunboat', current_popup_card))
		hide_popup_menu();
}

function on_card_build_corsair() {
	if (send_action('card_build_corsair', current_popup_card))
		hide_popup_menu();
}

function is_card_action(action, card) {
	return view.actions && view.actions[action] && view.actions[action].includes(card);
}

function on_click_card(evt) {
	if (view.actions) {
		let card = evt.target.card;
		if (is_card_action('discard', card)) {
			send_action('discard', card);
		} else {
			let menu = [];
			if (is_card_action('card_event', card)) menu.push('card_event');
			if (is_card_action('card_take', card)) menu.push('card_take');
			if (is_card_action('card_move_frigates', card)) menu.push('card_move_frigates');
			if (is_card_action('card_pirate_raid', card)) menu.push('card_pirate_raid');
			if (is_card_action('card_build_gunboat', card)) menu.push('card_build_gunboat');
			if (is_card_action('card_build_corsair', card)) menu.push('card_build_corsair');
			if (menu.length > 0) {
				current_popup_card = card;
				show_popup_menu(evt, menu);
			}
		}
	}
}

/* INITIALIZE CLIENT */

build_map();
scroll_with_middle_mouse("main");
