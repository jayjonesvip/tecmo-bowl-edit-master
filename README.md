window.TSB_HACK_SOURCE = "https://tecmobowl.org/forums/topic/69338-set-commands-list-for-nes-tsb-updated-91725/";

window.TSB_HACKS = [
  {
    id: "game_year",
    category: "Graphics/Text",
    title: "Game Year",
    type: "year",
    note: "Updates all six ASCII year displays together, including the splash screen.",
    options: [
      {
        label: "Four-digit year",
        description: "Writes the same four ASCII digits to every known original TSB year location.",
        offsets: [0xC129, 0xC4E4, 0x1E128, 0x1E28A, 0x1E2BD, 0x1F89B],
        defaultValue: "2026",
      },
    ],
  },
  {
    id: "fumbles",
    category: "Offense",
    title: "Fumble Behavior",
    type: "choice",
    note: "These options share the same probability table area, so pick one behavior.",
    options: [
      {
        label: "Always fumble",
        description: "Sets the fumble probability table to FF.",
        sets: [{ offset: 0x2BF04, hex: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF" }],
      },
      {
        label: "Never fumble",
        description: "Sets the fumble probability table to 00.",
        sets: [{ offset: 0x2BF04, hex: "00000000000000000000000000000000" }],
      },
      {
        label: "Multiple fumbles",
        description: "Allows repeat fumbles, but the source notes this can break onside kicks.",
        sets: [{ offset: 0x2AE10, hex: "00" }],
      },
    ],
  },
  {
    id: "cpu_runner_lane",
    category: "Offense",
    title: "CPU Runner Open Field Logic",
    type: "choice",
    note: "Controls how the CPU moves when there are no defenders directly ahead.",
    options: [
      {
        label: "Angle to sidelines",
        description: "CPU angles toward sideline space.",
        sets: [
          { offset: 0x28F68, hex: "78" },
          { offset: 0x28F6D, hex: "88" },
          { offset: 0x28FCF, hex: "08" },
          { offset: 0x28FD4, hex: "F8" },
        ],
      },
      {
        label: "Run straight",
        description: "CPU keeps a straighter open-field path.",
        sets: [
          { offset: 0x28F68, hex: "80" },
          { offset: 0x28F6D, hex: "80" },
          { offset: 0x28FCF, hex: "00" },
          { offset: 0x28FD4, hex: "00" },
        ],
      },
    ],
  },
  {
    id: "lob_button",
    category: "Offense",
    title: "Lob Pass Button",
    type: "toggle",
    note: "Switches lob throws to START instead of B.",
    options: [
      {
        label: "Use START for lob passes",
        description: "Applies the START-button lob passing patch.",
        sets: [
          { offset: 0x00006, hex: "42" },
          { offset: 0x2912D, hex: "50" },
          { offset: 0x2B2C1, hex: "E0BFAA" },
          { offset: 0x2BFF0, hex: "20AADDAAE007900C2008A12910C910D003A006608AA860" },
        ],
      },
    ],
  },
  {
    id: "qb_pr_ball_control",
    category: "Offense",
    title: "QB/PR Ball Control",
    type: "toggle",
    note: "Applies the listed QB and punt returner ball-control bytes.",
    options: [
      {
        label: "Enable QB/PR ball control",
        description: "Writes the two control bytes from the TSB list.",
        sets: [
          { offset: 0x286C7, hex: "12" },
          { offset: 0x286E7, hex: "14" },
        ],
      },
    ],
  },
  {
    id: "pa_pc_swap",
    category: "Offense",
    title: "PA/PC Meaning",
    type: "toggle",
    note: "Makes PC act as INT and PA act as target according to the patch note.",
    options: [
      {
        label: "PC is INT, PA is target",
        description: "Applies the PA/PC swap patch.",
        sets: [
          { offset: 0x29FEC, hex: "88" },
          { offset: 0x29E54, hex: "20F79F" },
          { offset: 0x2A007, hex: "A0874CDD9F" },
        ],
      },
    ],
  },
  {
    id: "passer_rating_req",
    category: "Offense",
    title: "Passer Rating Requirement",
    type: "toggle",
    note: "NOPs the passer rating requirement sequence from the source list.",
    options: [
      {
        label: "Disable requirement",
        description: "Writes eight EA bytes at the listed offset.",
        sets: [{ offset: 0x31CF7, hex: "EAEAEAEAEAEAEAEA" }],
      },
    ],
  },
  {
    id: "touchback",
    category: "Special Teams",
    title: "Touchback Spot",
    type: "choice",
    note: "Moves touchbacks to the 25 yard line.",
    options: [
      {
        label: "25 yard line",
        description: "Applies both touchback spot bytes.",
        sets: [
          { offset: 0x25077, hex: "28" },
          { offset: 0x25090, hex: "C8" },
        ],
      },
    ],
  },
  {
    id: "kickoff_30",
    category: "Special Teams",
    title: "Kickoff Position",
    type: "choice",
    note: "Moves kickoff position to the 30 for player 1, player 2, or both.",
    options: [
      {
        label: "Both teams to 30",
        description: "Applies both player 1 and player 2 kickoff-position patches.",
        sets: [
          { offset: 0x247B9, hex: "A060" },
          { offset: 0x247BB, hex: "A207" },
          { offset: 0x24031, hex: "A0A0" },
          { offset: 0x24033, hex: "A208" },
        ],
      },
      {
        label: "Player 1 to 30",
        description: "Applies only player 1 kickoff-position bytes.",
        sets: [
          { offset: 0x247B9, hex: "A060" },
          { offset: 0x247BB, hex: "A207" },
        ],
      },
      {
        label: "Player 2 to 30",
        description: "Applies only player 2 kickoff-position bytes.",
        sets: [
          { offset: 0x24031, hex: "A0A0" },
          { offset: 0x24033, hex: "A208" },
        ],
      },
    ],
  },
  {
    id: "punt_coverage_boost",
    category: "Special Teams",
    title: "Punt Coverage Boost",
    type: "toggle",
    note: "Source note says the first SET affects the punter; the second affects the rest of punt coverage.",
    options: [
      {
        label: "Enable boost adjustment",
        description: "Writes both punt coverage boost sequences.",
        sets: [
          { offset: 0x8164, hex: "E200E300" },
          { offset: 0x8170, hex: "E200E300" },
        ],
      },
    ],
  },
  {
    id: "playcall_clock",
    category: "Graphics/Text",
    title: "Playcall Screen Clock",
    type: "number",
    note: "The source example sets this byte to 5 seconds. Enter a value from 0 to 255.",
    options: [
      {
        label: "Clock seconds",
        description: "One-byte playcall screen clock speed value.",
        offset: 0x222D2,
        min: 0,
        max: 255,
        defaultValue: 5,
      },
    ],
  },
  {
    id: "quarter_length",
    category: "Graphics/Text",
    title: "Quarter Length",
    type: "number",
    note: "Generic one-byte editor for the quarter-length offset from the set-command list.",
    options: [
      {
        label: "Quarter length byte",
        description: "Write a decimal byte value.",
        offset: 0x2D269,
        min: 0,
        max: 255,
        defaultValue: 5,
      },
    ],
  },
  {
    id: "p2_condition_fix",
    category: "Simulation",
    title: "Player 2 Conditions Fix",
    type: "toggle",
    note: "Fixes an original-game issue noted in the source thread.",
    options: [
      {
        label: "Apply Player 2 condition fix",
        description: "Writes the condition-fix jump and supporting routine.",
        sets: [
          { offset: 0x30E55, hex: "20809F" },
          { offset: 0x31F90, hex: "A66EE46DF00218603860A66EE46DF00218603860" },
        ],
      },
    ],
  },
];
