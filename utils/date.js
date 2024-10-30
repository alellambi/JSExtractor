export function getDate() {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, "0");

	const months = {
		0: { abbr: "ENE", full: "ENERO" },
		1: { abbr: "FEB", full: "FEBRERO" },
		2: { abbr: "MAR", full: "MARZO" },
		3: { abbr: "ABR", full: "ABRIL" },
		4: { abbr: "MAY", full: "MAYO" },
		5: { abbr: "JUN", full: "JUNIO" },
		6: { abbr: "JUL", full: "JULIO" },
		7: { abbr: "AGO", full: "AGOSTO" },
		8: { abbr: "SEP", full: "SEPTIEMBRE" },
		9: { abbr: "OCT", full: "OCTUBRE" },
		10: { abbr: "NOV", full: "NOVIEMBRE" },
		11: { abbr: "DIC", full: "DICIEMBRE" },
	};

	const abbrMonth = months[today.getMonth()].abbr;
	const fullMonth = months[today.getMonth()].full;
	const year = String(today.getFullYear()).slice(-2);
	return {
		fileDate: `${day}${abbrMonth}${year}`,
		textDate: `${day} DE ${fullMonth} DE 20${year}`,
	};
}
