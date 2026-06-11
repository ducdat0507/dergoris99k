// Data-driven piece definitions for main modes
// Each piece has 4 orientations (0,1,2,3). Each orientation defines a bounding box and the filled cells within it.
// Cells are [dy, dx] relative to the pieceTopCorner (top-left of the bounding box at placement time).

// Helper to build orientation from string rows
function gridToCells(rows) {
	const cells = [];
	const h = rows.length;
	const w = rows[0].length;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (rows[y][x] === "1") cells.push([y, x]);
		}
	}
	return { width: w, height: h, cells };
}

// Orientations for T, S, Z, J, L follow the existing dergoris 3x3 patterns
const T_ORI = [
	gridToCells(["000","111","010"]),
	gridToCells(["010","110","010"]),
	gridToCells(["000","010","111"]),
	gridToCells(["010","011","010"]),
];

const S_ORI = [
	gridToCells(["000","011","110"]),
	gridToCells(["010","011","001"]),
	gridToCells(["000","011","110"]),
	gridToCells(["100","110","010"]),
];

const Z_ORI = [
	gridToCells(["000","110","011"]),
	gridToCells(["001","011","010"]),
	gridToCells(["000","110","011"]),
	gridToCells(["010","110","100"]),
];

const J_ORI = [
	gridToCells(["000","111","001"]),
	gridToCells(["010","010","110"]),
	gridToCells(["000","100","111"]),
	gridToCells(["011","010","010"]),
];

const L_ORI = [
	gridToCells(["000","111","100"]),
	gridToCells(["110","010","010"]),
	gridToCells(["000","001","111"]),
	gridToCells(["010","010","011"]),
];

// I piece uses a 4x4 bounding box in this system (matches special-case behavior but unified here)
const I_ORI = [
	gridToCells(["0000","1111","0000","0000"]),
	gridToCells(["0010","0010","0010","0010"]),
	gridToCells(["0000","1111","0000","0000"]),
	gridToCells(["0100","0100","0100","0100"]),
];

// O piece uses 2x2 bounding box; rotations are identical (no rotation applied in controls, but defined for convenience)
const O_ORI = [
	gridToCells(["11","11"]),
	gridToCells(["11","11"]),
	gridToCells(["11","11"]),
	gridToCells(["11","11"]),
];

// Pentominoes
const pent1_ORI = [ //P1
	gridToCells(["000","111","110"]),
	gridToCells(["011","011","010"]),
	gridToCells(["000","011","111"]),
	gridToCells(["100","110","110"]),
];

const pent2_ORI = [ //P2
	gridToCells(["000","111","011"]),
	gridToCells(["001","011","011"]),
	gridToCells(["000","110","111"]),
	gridToCells(["110","110","100"]),
];

const pent3_ORI = [ //F1
	gridToCells(["001","111","010"]),
	gridToCells(["010","110","011"]),
	gridToCells(["010","111","100"]),
	gridToCells(["110","011","010"]),
];

const pent4_ORI = [ //F2
	gridToCells(["100","111","010"]),
	gridToCells(["011","110","010"]),
	gridToCells(["010","111","001"]),
	gridToCells(["010","011","110"]),
];

const pent5_ORI = [ //U
	gridToCells(["000","111","101"]),
	gridToCells(["110","010","110"]),
	gridToCells(["000","101","111"]),
	gridToCells(["011","010","011"]),
];

const pent6_ORI = [ //W
	gridToCells(["100","110","011"]),
	gridToCells(["011","110","100"]),
	gridToCells(["110","011","001"]),
	gridToCells(["001","011","110"]),
];

const pent7_ORI = [ //X
	gridToCells(["010","111","010"]),
	gridToCells(["010","111","010"]),
	gridToCells(["010","111","010"]),
	gridToCells(["010","111","010"]),
];

const pent8_ORI = [ //V
	gridToCells(["100","100","111"]),
	gridToCells(["111","100","100"]),
	gridToCells(["111","001","001"]),
	gridToCells(["001","001","111"]),
];

const pent9_ORI = [ //T
	gridToCells(["111","010","010"]),
	gridToCells(["001","111","001"]),
	gridToCells(["010","010","111"]),
	gridToCells(["100","111","100"]),
];

const pent10_ORI = [ //Z1
	gridToCells(["100","111","001"]),
	gridToCells(["011","010","110"]),
	gridToCells(["100","111","001"]),
	gridToCells(["011","010","110"]),
];

const pent11_ORI = [ //Z2
	gridToCells(["001","111","100"]),
	gridToCells(["110","010","011"]),
	gridToCells(["001","111","100"]),
	gridToCells(["110","010","011"]),
];

// Discordant pieces
const disc1_ORI = [
	gridToCells(["000","101","101"]),
	gridToCells(["011","000","011"]),
	gridToCells(["000","101","101"]),
	gridToCells(["110","000","110"]),
]

const disc2_ORI = [
	gridToCells(["000","011","101"]),
	gridToCells(["010","001","011"]),
	gridToCells(["000","101","110"]),
	gridToCells(["110","100","010"]),
]

const disc3_ORI = [
	gridToCells(["000","110","101"]),
	gridToCells(["011","001","010"]),
	gridToCells(["000","101","011"]),
	gridToCells(["010","100","110"]),
]

const disc4_ORI = [
	gridToCells(["010","011","100"]),
	gridToCells(["100","011","010"]),
	gridToCells(["001","110","010"]),
	gridToCells(["010","110","001"]),
]

const disc5_ORI = [
	gridToCells(["001","101","010"]),
	gridToCells(["010","100","011"]),
	gridToCells(["010","101","100"]),
	gridToCells(["110","001","010"]),
]

const disc6_ORI = [
	gridToCells(["100","101","010"]),
	gridToCells(["011","100","010"]),
	gridToCells(["010","101","001"]),
	gridToCells(["010","001","110"]),
]

// Mega pieces

const mega1_ORI = [
	gridToCells(["111","111","111"]),
	gridToCells(["111","111","111"]),
	gridToCells(["111","111","111"]),
	gridToCells(["111","111","111"]),
]

const mega2_ORI = [
	gridToCells(["100","110","111"]),
	gridToCells(["111","110","100"]),
	gridToCells(["111","011","001"]),
	gridToCells(["001","011","111"]),
]

const mega3_ORI = [
	gridToCells(["0110","1111","1111","0110"]),
	gridToCells(["0110","1111","1111","0110"]),
	gridToCells(["0110","1111","1111","0110"]),
	gridToCells(["0110","1111","1111","0110"]),
]

const mega4_ORI = [
	gridToCells(["1111","1111","1111","1111"]),
	gridToCells(["1111","1111","1111","1111"]),
	gridToCells(["1111","1111","1111","1111"]),
	gridToCells(["1111","1111","1111","1111"]),
]

const mega5_ORI = [
	gridToCells(["1000","1100","1110","1111"]),
	gridToCells(["1111","1110","1100","1000"]),
	gridToCells(["1111","0111","0011","0001"]),
	gridToCells(["0001","0011","0111","1111"]),
]

// Global piece definition list in spawn order (I,O,T,S,Z,J,L)
// kickType determines which legacy kick order to use in rotatePiece: 'I', 'O', or 'other'
const pieceDefs = [
	{ id: 0, name: "I", colorIndex: 1, kickType: "I", orientations: I_ORI, nextPieceYPos: 3 },
	{ id: 1, name: "O", colorIndex: 2, kickType: "O", orientations: O_ORI, nextPieceYPos: 3 },
	{ id: 2, name: "T", colorIndex: 3, kickType: "other", orientations: T_ORI, nextPieceYPos: 4 },
	{ id: 3, name: "S", colorIndex: 4, kickType: "other", orientations: S_ORI, nextPieceYPos: 4 },
	{ id: 4, name: "Z", colorIndex: 5, kickType: "other", orientations: Z_ORI, nextPieceYPos: 4 },
	{ id: 5, name: "J", colorIndex: 6, kickType: "other", orientations: J_ORI, nextPieceYPos: 4 },
	{ id: 6, name: "L", colorIndex: 7, kickType: "other", orientations: L_ORI, nextPieceYPos: 4 },
	// Pentominoes
	{ id: 7, name: "pent1", colorIndex: 10, kickType: "other", orientations: pent1_ORI, nextPieceYPos: 4 },
	{ id: 8, name: "pent2", colorIndex: 10, kickType: "other", orientations: pent2_ORI, nextPieceYPos: 4 },
	{ id: 9, name: "pent3", colorIndex: 10, kickType: "other", orientations: pent3_ORI, nextPieceYPos: 4 },
	{ id: 10, name: "pent4", colorIndex: 10, kickType: "other", orientations: pent4_ORI, nextPieceYPos: 4 },
	{ id: 11, name: "pent5", colorIndex: 10, kickType: "other", orientations: pent5_ORI, nextPieceYPos: 4 },
	{ id: 12, name: "pent6", colorIndex: 10, kickType: "other", orientations: pent6_ORI, nextPieceYPos: 4 },
	{ id: 13, name: "pent7", colorIndex: 10, kickType: "other", orientations: pent7_ORI, nextPieceYPos: 4 },
	{ id: 14, name: "pent8", colorIndex: 10, kickType: "other", orientations: pent8_ORI, nextPieceYPos: 4 },
	{ id: 15, name: "pent9", colorIndex: 10, kickType: "other", orientations: pent9_ORI, nextPieceYPos: 4 },
	{ id: 16, name: "pent10", colorIndex: 10, kickType: "other", orientations: pent10_ORI, nextPieceYPos: 4 },
	{ id: 17, name: "pent11", colorIndex: 10, kickType: "other", orientations: pent11_ORI, nextPieceYPos: 4 },
	// Discordant minoes
	{ id: 18, name: "disc1", colorIndex: 8, kickType: "other", orientations: disc1_ORI, nextPieceYPos: 4 },
	{ id: 19, name: "disc2", colorIndex: 8, kickType: "other", orientations: disc2_ORI, nextPieceYPos: 4 },
	{ id: 20, name: "disc3", colorIndex: 8, kickType: "other", orientations: disc3_ORI, nextPieceYPos: 4 },
	{ id: 21, name: "disc4", colorIndex: 8, kickType: "other", orientations: disc4_ORI, nextPieceYPos: 4 },
	{ id: 22, name: "disc5", colorIndex: 8, kickType: "other", orientations: disc5_ORI, nextPieceYPos: 4 },
	{ id: 23, name: "disc6", colorIndex: 8, kickType: "other", orientations: disc6_ORI, nextPieceYPos: 4 },
	// Megaminoes
	{ id: 24, name: "mega1", colorIndex: 9, kickType: "O", orientations: mega1_ORI, nextPieceYPos: 4 },
	{ id: 25, name: "mega2", colorIndex: 9, kickType: "other", orientations: mega2_ORI, nextPieceYPos: 4 },
	{ id: 26, name: "mega3", colorIndex: 9, kickType: "O", orientations: mega3_ORI, nextPieceYPos: 4 },
	{ id: 27, name: "mega4", colorIndex: 9, kickType: "O", orientations: mega4_ORI, nextPieceYPos: 4 },
	{ id: 28, name: "mega5", colorIndex: 9, kickType: "other", orientations: mega5_ORI, nextPieceYPos: 4 },
];

// Expose globally
window.pieceDefs = pieceDefs;
window.getPieceDef = function(pieceType){ return pieceDefs[pieceType]; };
