// Synthetic supplied projections only. Expected observations never enter .mal.
const no = n => Array(n).fill('NO');
const yes = n => Array(n).fill('THIS');
const alternating = n => Array.from({length:n}, (_, i) => i % 2 ? 'THIS' : 'NO');
const fixture = (id, left, right, expected, operator='THIS', witness='WHAT', caseId=id) =>
  ({id, case:caseId, position:{operator,witness}, left, right, expected});

export const fixtures = [
  fixture('EQUAL_ZERO_256', no(256), no(256), 'IF_THEN'),
  fixture('EQUAL_ONE_256', yes(256), yes(256), 'IF_THEN'),
  fixture('EQUAL_ALTERNATING_256', alternating(256), alternating(256), 'IF_THEN'),
  fixture('DIFFER_FIRST_BIT_256', no(256), ['THIS', ...no(255)], 'NOT_SAME'),
  fixture('DIFFER_LAST_BIT_256', no(256), [...no(255), 'THIS'], 'NOT_SAME'),
  fixture('DIFFER_ALL_BITS_256', no(256), yes(256), 'NOT_SAME'),
  fixture('DIFFER_THIS_NO', ['THIS'], ['NO'], 'NOT_SAME'),
  fixture('EQUAL_EMPTY', [], [], 'IF_THEN'),
  fixture('LEFT_SHORT', ['NO'], ['NO','THIS'], 'NOT_SAME'),
  fixture('RIGHT_SHORT', ['NO','THIS'], ['NO'], 'NOT_SAME'),
  fixture('LEFT_EMPTY_PRESENT', [], ['NO'], 'NOT_SAME'),
  fixture('RIGHT_EMPTY_PRESENT', ['NO'], [], 'NOT_SAME'),
  fixture('LEFT_ABSENT', null, no(256), 'MAYBE'),
  fixture('RIGHT_ABSENT', no(256), null, 'MAYBE'),
  fixture('BOTH_ABSENT', null, null, 'MAYBE'),
  fixture('LEFT_ABSENT_RIGHT_EMPTY', null, [], 'MAYBE'),
  fixture('RIGHT_ABSENT_LEFT_EMPTY', [], null, 'MAYBE'),
  fixture('POSITION_THIS_WHAT', ['NO'], ['NO'], 'IF_THEN', 'THIS', 'WHAT', 'REPEATED_WITNESS'),
  fixture('POSITION_NO_WHAT', ['NO'], ['THIS'], 'NOT_SAME', 'NO', 'WHAT', 'REPEATED_WITNESS'),
  fixture('POSITION_SAME_WHAT', null, ['NO'], 'MAYBE', 'SAME_NOT_SAME', 'WHAT', 'REPEATED_WITNESS'),
  fixture('WITNESS_WHAT', ['THIS'], ['THIS'], 'IF_THEN', 'THIS', 'WHAT', 'REPEATED_OPERATOR'),
  fixture('WITNESS_HOW', ['THIS'], ['NO'], 'NOT_SAME', 'THIS', 'HOW', 'REPEATED_OPERATOR'),
  fixture('WITNESS_FOR_WHAT', ['THIS'], null, 'MAYBE', 'THIS', 'FOR_WHAT', 'REPEATED_OPERATOR'),
  fixture('MALFORMED_EQUAL_HEAD', ['MALFORMED'], ['MALFORMED'], null),
  fixture('MALFORMED_EQUAL_AFTER_PREFIX', ['NO','MALFORMED'], ['NO','MALFORMED'], null),
];

const atom = s => {
  if (!/^[A-Z][A-Z_0-9]*$/.test(s)) throw Error('FIXTURE_ATOM');
  return s;
};
const bits = values => values.reduceRight((tail, bit) => `CONS(${JSON.stringify(bit)},${tail})`, 'NIL');
const side = values => values === null ? 'ABSENT' : `PRESENT(${bits(values)})`;
export const request = f => `GOES_WITH(GJC_REQUEST,${atom(f.case)},POSITION(${atom(f.position.operator)},${atom(f.position.witness)}),${side(f.left)},${side(f.right)})`;
export const fixtureSource = rows => '// Synthetic supplied projections. No J17 field, record extraction, or inferred partition.\n'
  + '@propose seed GJC_SYNTHETIC_INPUTS := {\n  ' + rows.map(request).join(',\n  ') + '\n};\n';
