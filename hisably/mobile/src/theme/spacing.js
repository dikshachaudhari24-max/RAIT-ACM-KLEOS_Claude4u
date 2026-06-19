// Rhythmic spacing, radius and elevation tokens (Skybound Ledger)
export const spacing = {
  screenH: 20,         // horizontal screen margin (both sides)
  cardGap: 16,         // vertical gap between cards
  sectionGap: 32,      // gap between sections
  cardPadding: 16,     // padding inside cards
  rowPaddingV: 12,     // compact list row vertical padding
  rowPaddingH: 16,     // compact list row horizontal padding
  fieldGap: 4,         // gap between label and value in a field row
  iconTextGap: 12,     // gap between icon and text in a list row
  tabBottom: 20,       // floating tab bar margin from screen bottom
  sheetTop: 24,        // content sheet top padding (below rounded edge)
  sectionHeaderGap: 12,// gap below a section header before its content
};

export const radius = {
  card: 20,
  button: 28,
  pill: 50,
  sheet: 32,
  chip: 50,
  smallBtn: 20,
  tile: 20,
};

export const shadow = {
  // soft ambient card shadow
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  // slightly stronger for illustration documents
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 2,
  },
  // floating navigation bar — hovers above all content
  nav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};
