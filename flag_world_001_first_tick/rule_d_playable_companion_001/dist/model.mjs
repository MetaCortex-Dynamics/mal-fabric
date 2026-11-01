// A display state machine over two closed records. It generates no offers or world links.
export function initialState(scenario = 'nested') {
  if (!['nested', 'contrast'].includes(scenario)) throw Error('Unsupported recorded field');
  return { scenario, attempted: false, inspect: false, support: true };
}
export function update(state, action) {
  if (action.type === 'scenario') return { ...initialState(action.value), support: state.support };
  if (action.type === 'reset') return { ...initialState(state.scenario), support: state.support };
  if (action.type === 'try') return { ...state, attempted: true, inspect: false };
  if (action.type === 'inspect') return { ...state, inspect: state.attempted && state.scenario === 'nested' && !state.inspect };
  if (action.type === 'support') return { ...state, support: action.value };
  return state;
}
export function view(data, state) {
  const field = data.fields[state.scenario];
  const applied = state.attempted && field.receipt.strict === 'IF_THEN';
  const candidate = applied || state.inspect;
  return {
    field, applied, candidate,
    readings: candidate ? field.candidateReadings : field.readings,
    walls: candidate ? field.candidateWalls : field.walls,
    phase: state.inspect ? 'WITHHELD_PREVIEW' : applied ? 'RECORDED_RESULT' : state.attempted ? 'HELD' : 'RECORDED_SOURCE'
  };
}
