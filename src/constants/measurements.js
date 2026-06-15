export const MEASUREMENTS = [
  { key: "sharwal",  label: "شەرواڵ"   },
  { key: "nawqad",   label: "ناوقەد"   },
  { key: "sang",     label: "سنگ"      },
  { key: "shan",     label: "شان"      },
  { key: "qol",      label: "قۆڵ"      },
  { key: "machak",   label: "بن دەستە" },
  { key: "damaqach", label: "دەلینگ"   },
];

export const EMPTY_M = Object.fromEntries(MEASUREMENTS.map(m => [m.key, ""]));
