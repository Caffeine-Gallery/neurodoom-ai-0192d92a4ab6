export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'updateEnemyPositions' : IDL.Func(
        [
          IDL.Float64,
          IDL.Float64,
          IDL.Vec(IDL.Record({ 'x' : IDL.Float64, 'y' : IDL.Float64 })),
        ],
        [IDL.Vec(IDL.Record({ 'x' : IDL.Float64, 'y' : IDL.Float64 }))],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
