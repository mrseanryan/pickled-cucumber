import opContains from './contains';
import opExists from './exists';
import opHasKeys from './has-keys';
import opIncludes from './includes';
import opIs from './is';
import opMatches from './matches';
import opStartsWith from './starts-with';
import { OperatorMap } from './types';

const OPERATORS = [
  opContains,
  opExists,
  opHasKeys,
  opIncludes,
  opIs,
  opMatches,
  opStartsWith,
].reduce(
  (acc, op) => {
    if (typeof op.name === 'string') acc[op.name] = op;
    else op.name.forEach(name => acc[name] = op);
    return acc;
  },
  {} as OperatorMap,
);

export default OPERATORS;

export const opAtSpec = '[\\w.\\[\\]\\$\\{\\}-]+';

export const getOpSpec = (ops: OperatorMap = {}) => {
  const keys = Object.keys({ ...ops, ...OPERATORS })
    .sort()
    .join('|');
  return `${keys}|at ${opAtSpec} (?:${keys})`;
};