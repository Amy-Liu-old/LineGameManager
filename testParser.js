function normalizeAndCheck(input) {
  const normalized = input.replace(/＋/g, '+').replace(/\s+/g, '');

  const patterns = [
    {
      pattern_id: 1,
      description: '?@MM/DD, H-H',
      regex: /^\?@(\d{1,2})\/(\d{1,2}),(\d{1,2})-(\d{1,2})$/,
      extract: ([, mm, dd, h1, h2]) => ({ param: mm, name: null, month: mm, day: dd, start_h: h1, end_h: h2 })
    },
    {
      pattern_id: 2,
      description: '?@MM/DD',
      regex: /^\?@(\d{1,2})\/(\d{1,2})$/,
      extract: ([, mm, dd]) => ({ param: mm, name: null, month: mm, day: dd, start_h: null, end_h: null })
    },
    {
      pattern_id: 3,
      description: '?@',
      regex: /^\?@$/,
      extract: () => ({ param: null, name: null, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 4,
      description: '[Name]+N@MM/DD, H-H',
      regex: /^([A-Za-z]*)\+(\d{1,2})@(\d{1,2})\/(\d{1,2}),(\d{1,2})-(\d{1,2})$/,
      extract: ([, name, , mm, dd, h1, h2]) => ({ param: name, name, month: mm, day: dd, start_h: h1, end_h: h2 })
    },
    {
      pattern_id: 5,
      description: '[Name]+N@MM/DD',
      regex: /^([A-Za-z]*)\+(\d{1,2})@(\d{1,2})\/(\d{1,2})$/,
      extract: ([, name, , mm, dd]) => ({ param: name, name, month: mm, day: dd, start_h: null, end_h: null })
    },
    {
      pattern_id: 6,
      description: '[Name]+N@',
      regex: /^([A-Za-z]*)\+(\d{1,2})@$/,
      extract: ([, name]) => ({ param: name, name, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 6, // Reuse same pattern_id as +N@ since they are equivalent
      description: '[Name]+N',
      regex: /^([A-Za-z]*)\+(\d{1,2})$/,
      extract: ([, name]) => ({ param: name, name, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 7,
      description: '[Name]-N@MM/DD, H-H',
      regex: /^([A-Za-z]*)-(\d{1,2})@(\d{1,2})\/(\d{1,2}),(\d{1,2})-(\d{1,2})$/,
      extract: ([, name, , mm, dd, h1, h2]) => ({ param: name, name, month: mm, day: dd, start_h: h1, end_h: h2 })
    },
    {
      pattern_id: 8,
      description: '[Name]-N@MM/DD',
      regex: /^([A-Za-z]*)-(\d{1,2})@(\d{1,2})\/(\d{1,2})$/,
      extract: ([, name, , mm, dd]) => ({ param: name, name, month: mm, day: dd, start_h: null, end_h: null })
    },
    {
      pattern_id: 9,
      description: '[Name]-N@',
      regex: /^([A-Za-z]*)-(\d{1,2})@$/,
      extract: ([, name]) => ({ param: name, name, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 9, // Reuse same pattern_id as -N@ since they are equivalent
      description: '[Name]-N',
      regex: /^([A-Za-z]*)-(\d{1,2})$/,
      extract: ([, name]) => ({ param: name, name, month: null, day: null, start_h: null, end_h: null })
    }	  
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern.regex);
    if (match) {
      return {
        pattern_id: pattern.pattern_id,
        type: pattern.description,
        ...pattern.extract(match)
      };
    }
  }

  return {
    pattern_id: 0,
    type: 'No match',
    param: null,
    name: null,
    month: null,
    day: null,
    start_h: null,
    end_h: null
  };
}

// === Example usage ===
const inputs = [
  '?@12/25, 8-12',
  '?@',
  '?@5/1',
  'Amy5',
  '陳曉華8',
  '陳曉華',
  'Bob+1@',
  'X-3@12/30',
  '+1@',
  '-1',
  '+1',
  'NotMatching'
];
const userName="陳曉華";
const regex = new RegExp(`^${userName}\\d*$`);
    console.log(regex);

for (const input of inputs) {
  console.log('Input:', input);
  console.log(regex.test(input));
  console.log('---');
}
