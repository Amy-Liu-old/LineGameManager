function normalizeAndCheck(input) {
  // Normalize input while preserving name spacing
  let normalized = input 
    if (/\s*\?/.test(normalized)) {
       normalized = normalized.replace(/\s+/g, ''); // ignore all spaces if ? is present
    } else {
       normalized = normalized.replace(/\s*(\/|@|,|-)\s*/g, '$1'); // else trim around symbols
    }
  const patterns = [
    {
      pattern_id: 1,
      description: '?@',
      regex: /^\?\?/,
      extract: () => ({ name: null, count: null, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 1,
      description: '??',
      regex: /^\？\？$/,
      extract: () => ({ name: null, count: null, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 1,
      description: '報名',
      regex: /^報名$/,
      extract: () => ({ name: null, count: null, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 1,
      description: '報名狀況',
      regex: /^報名狀況$/,
      extract: () => ({ name: null, count: null, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 2,
      description: '[Name]+N@MM/DD, H-H',
      regex: /^(.*?)\+(\d{1,2})@(\d{1,2})\/(\d{1,2}),(\d{1,2})-(\d{1,2})$/,
      extract: ([, name, count, mm, dd, h1, h2]) => ({ name, count, month: mm, day: dd, start_h: h1, end_h: h2 })
    },
    {
      pattern_id: 2,
      description: '[Name]+N@MM/DD H-H',
      regex: /^(.*?)\+(\d{1,2})@(\d{1,2})\/(\d{1,2}) (\d{1,2})-(\d{1,2})$/,
      extract: ([, name, count, mm, dd, h1, h2]) => ({ name, count, month: mm, day: dd, start_h: h1, end_h: h2 })
    },
    {
      pattern_id: 2,
      description: '[Name]+N@MM/DD',
      regex: /^(.*?)\+(\d{1,2})@(\d{1,2})\/(\d{1,2})$/,
      extract: ([, name, count, mm, dd]) => ({ name, count, month: mm, day: dd, start_h: null, end_h: null })
    },
    {
      pattern_id: 2,
      description: '[Name]+N@',
      regex: /^(.*?)\+(\d{1,2})@$/,
      extract: ([, name, count]) => ({ name, count, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 2,
      description: '[Name]+N',
      regex: /^(.*?)\+(\d{1,2})$/,
      extract: ([, name, count]) => ({ name, count, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 3,
      description: '[Name]-N@MM/DD, H-H',
      regex: /^(.*?)\-(\d{1,2})@(\d{1,2})\/(\d{1,2}),(\d{1,2})-(\d{1,2})$/,
      extract: ([, name, count, mm, dd, h1, h2]) => ({ name, count, month: mm, day: dd, start_h: h1, end_h: h2 })
    },
    {
      pattern_id: 3,
      description: '[Name]-N@MM/DD',
      regex: /^(.*?)\-(\d{1,2})@(\d{1,2})\/(\d{1,2})$/,
      extract: ([, name, count, mm, dd]) => ({ name, count, month: mm, day: dd, start_h: null, end_h: null })
    },
    {
      pattern_id: 3,
      description: '[Name]-N@',
      regex: /^(.*?)\-(\d{1,2})@$/,
      extract: ([, name, count]) => ({ name, count, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 3,
      description: '[Name]-N',
      regex: /^(.*?)\-(\d{1,2})$/,
      extract: ([, name, count]) => ({ name, count, month: null, day: null, start_h: null, end_h: null })
    },
   /* {
      pattern_id: 4,
      description: '+-',
      regex: /^.*開團.*$/,
      extract: () => ({ name: null, count: null, month: null, day: null, start_h: null, end_h: null })
    },*/
    {
      pattern_id: 4,
      description: '+G',
      regex: /^\+G$/,
      extract: () => ({ name: null, count: null, month: null, day: null, start_h: null, end_h: null })
    },    {
      pattern_id: 4,
      description: '開團',
      regex: /^開團$/,
      extract: () => ({ name: null, count: null, month: null, day: null, start_h: null, end_h: null })
    },
    {
      pattern_id: 5,
      description: '名單',
      regex: /^名單$/,
      extract: () => ({ name: null, count: null, month: null, day: null, start_h: null, end_h: null })
    },
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern.regex);
    if (match) {
      const { name, count, month, day, start_h, end_h } = pattern.extract(match);
      const cleaned_name   = (name!= null)?name.trimStart():null;
      console.log(pattern.pattern_id);
      return {
        pattern_id: pattern.pattern_id,
        type: pattern.description,
        name: cleaned_name,
        count: count ? parseInt(count) : null,
        month: month ? parseInt(month) : null,
        day: day ? parseInt(day) : null,
        start_h: start_h ? parseInt(start_h) : null,
        end_h: end_h ? parseInt(end_h) : null
      };
    }
  }
  return null;
}

module.exports = normalizeAndCheck;
