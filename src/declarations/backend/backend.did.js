export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'updateEnemyPosition' : IDL.Func(
        [IDL.Float64, IDL.Float64, IDL.Float64, IDL.Float64],
        [IDL.Record({ 'x' : IDL.Float64, 'y' : IDL.Float64 })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
