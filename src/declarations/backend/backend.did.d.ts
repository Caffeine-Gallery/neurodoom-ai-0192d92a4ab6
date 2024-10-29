import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'updateEnemyPositions' : ActorMethod<
    [number, number, Array<{ 'x' : number, 'y' : number }>],
    Array<{ 'x' : number, 'y' : number }>
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
